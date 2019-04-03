import { Request, Response } from 'express';

import { IMeeting, MeetingStatus } from '../models/meeting';
import { fetchMeetingById } from '../models/meeting';
import Motion, {
  fetchMotionById,
  IMotion,
  MotionStatus
} from '../models/motion';
import { IMotionSet } from '../models/motion-set';
import { fetchMotionSetById } from '../models/motion-set';
import MotionType, { IMotionType, MotionClass } from '../models/motion-type';
import { fetchMotionTypeById } from '../models/motion-type';
import { fetchUserById, IUser } from '../models/user';

/**
 * Controller for motion based changes. Many of these modify meetings as well.
 * A separate file was used because motions have their own complex logic.
 */

export const makeMotion = async (req: Request, res: Response) => {
  req.assert('motionTypeId', 'A motion type is required').notEmpty();
  req.assert('ownerId', 'Motion owner is required').notEmpty();
  req.assert('meetingId', 'A meeting ID is required').notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }

  let owner: IUser;
  try {
    owner = await fetchUserById(req.body.ownerId);
  } catch (err) {
    return res.status(err.resCode).send(err.error);
  }

  let meeting: IMeeting;
  try {
    meeting = await fetchMeetingById(req.body.meetingId, true);
  } catch (err) {
    return res.status(err.code).send(err.msg);
  }

  if (meeting.status === MeetingStatus.ADJOURNED) {
    return res
      .status(400)
      .send('Motion can not be attached to an adjourned meeting.');
  }

  if (meeting.activeVotingRecord) {
    return res
      .status(400)
      .send('Can not make a motion while in voting procedure.');
  }

  if (meeting.chair.id !== req.user.id) {
    return res
      .status(403)
      .send('You must be chair of the meeting to add a motion to it.');
  }

  let motionType: IMotionType;
  try {
    motionType = await fetchMotionTypeById(req.body.motionTypeId);
  } catch (err) {
    return res.status(err.code).send(err.msg);
  }

  let motionSetIds: string[];
  try {
    const fullMotionSet = await fetchMotionSetById(meeting.motionSet.id);
    motionSetIds = fullMotionSet.motionTypes.map(mt => mt.id);
  } catch (err) {
    return res.status(500).send('Error getting the full motion set.');
  }

  if (!motionSetIds.includes(motionType.id)) {
    return res
      .status(400)
      .send("This motion's type is not valid for the given meeting.");
  }

  if (motionType.motionType === MotionClass.SUBSIDIARY && !req.body.effectId) {
    return res
      .status(400)
      .send('Subsidiary motions must be attached/effect another motion.');
  }

  if (motionType.motionType !== MotionClass.SUBSIDIARY && req.body.effectId) {
    return res
      .status(400)
      .send('Only subsidiary motions can be attached/effect other motions.');
  }

  let motion = new Motion({
    motionType,
    owner,
    motionStatus:
      motionType.motionType === MotionClass.INCIDENTAL
        ? MotionStatus.ACCEPTED
        : MotionStatus.PENDING,
    dateTimeMade: new Date()
  });

  if (req.body.effectId) {
    let effectedMotion: IMotion;
    try {
      effectedMotion = await fetchMotionById(req.body.effectId);
    } catch (err) {
      return res.status(err.code).send(err.msg);
    }

    // This should be fixed in issue #5
    if (
      motionType.name === 'Motion to Amend' &&
      !effectedMotion.motionType.amendable
    ) {
      return res.status(400).send('Effected/attached motion is not amendable.');
    }

    if (
      motionType.name === 'Motion to Amend' &&
      effectedMotion.motionStatus !== MotionStatus.PENDING
    ) {
      return res
        .status(400)
        .send('Effected/attached motion is no longer pending.');
    }

    motion.effects = effectedMotion;
  }

  if (motionType.requiresSecond) {
    if (!req.body.secondedById) {
      return res.status(400).send('This type of motion requires a second.');
    }

    let secondedBy: IUser;
    try {
      secondedBy = await fetchUserById(req.body.secondedById);
    } catch (err) {
      return res.status(err.resCode).send(err.error);
    }

    motion.secondedBy = secondedBy;
  }

  if (meeting.pendingMotions.length !== 0) {
    let fullPendingMotion: IMotion;
    try {
      fullPendingMotion = await fetchMotionById(
        meeting.pendingMotions[meeting.pendingMotions.length - 1].id
      );
    } catch (err) {
      return res.status(500).send('Could not get full pending motion.');
    }

    if (motion.effects.id !== fullPendingMotion.id) {
      return res
        .status(400)
        .send('Only the current motion the floor can be effected.');
    }

    const precedenceCompResult = compareMotionPrecedence(
      motion,
      fullPendingMotion
    );
    if (motion.motionType.name !== 'Motion to Amend') {
      if (precedenceCompResult < 1) {
        return res
          .status(400)
          .send(
            'Motion is out of order. The motion currently on the floor is of higher or the same precedence.'
          );
      }
    } else {
      if (precedenceCompResult < 0) {
        return res
          .status(400)
          .send(
            'Motion is out of order. The motion currently on the floor is of higher or the same precedence.'
          );
      }
    }
  }

  try {
    motion = await motion.save();
  } catch (err) {
    return res.status(500).send('Error creating new motion.');
  }

  if (motionType.motionType === MotionClass.INCIDENTAL) {
    meeting.motionHistory.push(motion);
  } else {
    meeting.pendingMotions.push(motion);
  }

  try {
    meeting = await meeting.save();
  } catch (err) {
    return res.status(500).send('Could not update meeting with new motion.');
  }

  return res.send(motion);
};

/**
 * Compares the precedence of two motions. Returns -1 if the first motion
 * has a lower precedence than the second, +1 if the first motion has
 * higher precedence than the second one and 0 if they have the same precedence.
 * @param m1 first motion to be compared
 * @param m2 second motion to be compared
 */
const compareMotionPrecedence = (m1: IMotion, m2: IMotion) => {
  const m1Class = m1.motionType.motionType;
  const m2Class = m2.motionType.motionType;

  if (m1Class === m2Class) {
    if (m1.motionType.precedence > m2.motionType.precedence) {
      return -1;
    }

    if (m1.motionType.precedence < m2.motionType.precedence) {
      return 1;
    }

    return 0;
  }

  if (m1Class === MotionClass.INCIDENTAL) {
    return 1;
  }

  if (
    m1Class === MotionClass.PRIVILEGED &&
    (m2Class === MotionClass.SUBSIDIARY || m2Class === MotionClass.MAIN)
  ) {
    return 1;
  }

  if (
    m1Class === MotionClass.SUBSIDIARY &&
    m2Class === MotionClass.PRIVILEGED
  ) {
    return -1;
  }

  if (
    m1Class === MotionClass.MAIN &&
    (m2Class === MotionClass.PRIVILEGED || m2Class === MotionClass.SUBSIDIARY)
  ) {
    return -1;
  }

  return 1;
};

export const getMotion = async (req: Request, res: Response) => {
  let motion: IMotion;
  try {
    motion = await fetchMotionById(req.params.motionId);
  } catch (err) {
    return res.status(err.code).send(err.msg);
  }

  return res.send(motion);
};
