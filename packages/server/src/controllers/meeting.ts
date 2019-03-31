import { Request, Response } from 'express';

import {
  AttendanceStatus,
  IAttendanceRecord,
  initializeAttendanceRecordFromRoster
} from '../models/attendance-record';
import Meeting, {
  fetchMeetingById,
  IMeeting,
  MeetingStatus
} from '../models/meeting';
import Motion, { IMotion, MotionStatus } from '../models/motion';
import { fetchMotionSetById, IMotionSet } from '../models/motion-set';
import { fetchRosterById, IRoster } from '../models/roster';
import { fetchUserById, IUser } from '../models/user';

/**
 * Controller for meeting functionality.
 */

export const getMeeting = async (req: Request, res: Response) => {
  // tslint:disable:no-unused-expression
  new Motion({}); // This is a really stupid hack to get the model to initialize if there are none

  let meeting: IMeeting;
  try {
    meeting = await fetchMeetingById(req.params.meetingId, true);
  } catch (err) {
    return res.status(err.code).send(err.msg);
  }

  if (
    meeting.chair.id !== req.user.id &&
    !getMemberAttendanceRecord(req.user.id, meeting)
  ) {
    return res
      .status(403)
      .send(
        "You must be a member of the meeting's roster or the chair of the meeting to get it."
      );
  }

  return res.send(meeting);
};

// Chair endpoints
export const startMeeting = async (req: Request, res: Response) => {
  req.assert('name', 'Meeting name is required').notEmpty();
  req.assert('rosterId', 'Roster ID is required').notEmpty();
  req.assert('motionSetId', 'Motion set ID is required').notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }

  let roster: IRoster;
  try {
    roster = await fetchRosterById(req.body.rosterId);
  } catch (err) {
    return res.status(err.resCode).send(err.error);
  }

  let attendanceRecords: IAttendanceRecord[];
  try {
    attendanceRecords = initializeAttendanceRecordFromRoster(roster);
  } catch (err) {
    return res
      .status(500)
      .send('There was an error creating an attendance record.');
  }

  let chair: IUser;
  try {
    chair = await fetchUserById(req.user.id);
  } catch (err) {
    return res.status(err.resCode).send(err.error);
  }

  let motionSet: IMotionSet;
  try {
    motionSet = await fetchMotionSetById(req.body.motionSetId);
  } catch (err) {
    return res.status(err.code).send(err.msg);
  }

  const meeting = new Meeting({
    name: req.body.name,
    motionSet,
    pendingMotions: new Array<IMotion>(),
    motionHistory: new Array<IMotion>(),
    motionQueue: new Array<IMotion>(),
    attendanceRecords,
    chair,
    status: MeetingStatus.IN_PROGRESS,
    startDateTime: new Date()
  });

  let savedMeeting: IMeeting;
  try {
    savedMeeting = await meeting.save();
  } catch (err) {
    return res.status(500).send('Error starting the meeting.');
  }

  return res.send(savedMeeting);
};

export const adjournMeeting = async (req: Request, res: Response) => {
  let meeting: IMeeting;
  try {
    meeting = await fetchMeetingById(req.params.meetingId, true);
  } catch (err) {
    return res.status(err.code).send(err.msg);
  }

  if (req.user.id !== meeting.chair.id) {
    return res
      .status(403)
      .send('You must be chair of the meeting to adjourn it.');
  }

  if (meeting.status === MeetingStatus.ADJOURNED) {
    return res
      .status(400)
      .send(`Meeting ${req.params.meetingId} is already adjourned.`);
  }

  meeting.status = MeetingStatus.ADJOURNED;

  // This currently does not seem to persist into the DB. Issue # 7
  meeting.pendingMotions.forEach(async motion => {
    motion.motionStatus = MotionStatus.TABLED;

    try {
      motion = await motion.save();
    } catch (err) {
      res.status(500).send("Error updating one of the meeting's motions");
    }

    meeting.motionHistory.push(motion);
  });

  meeting.pendingMotions = [];
  meeting.motionQueue = [];

  meeting.endDateTime = new Date();

  try {
    meeting = await meeting.save();
  } catch (err) {
    return res.status(500).send('Error adjourning the meeting.');
  }

  return res.send(meeting);
};

// Participant endpoints.
export const getMeetingsByMember = async (req: Request, res: Response) => {
  let meetings: IMeeting[];
  try {
    meetings = await Meeting.find({
      'attendanceRecords.member': req.user.id
    });
  } catch (err) {
    return res.status(500).send('Error getting meetings');
  }

  return res.send(meetings);
};

export const joinMeeting = async (req: Request, res: Response) => {
  req
    .assert('voting')
    .notEmpty()
    .isBoolean();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }

  let meeting: IMeeting;

  try {
    meeting = await fetchMeetingById(req.params.meetingId, true);
  } catch (err) {
    return res.status(err.code).send(err.msg);
  }

  try {
    meeting = await changeAttendanceStatus(
      req.user.id,
      meeting,
      AttendanceStatus.PRESENT,
      req.body.voting
    );
  } catch (err) {
    return res.status(err.code).send(err.msg);
  }

  return res.send(meeting);
};

export const leaveMeeting = async (req: Request, res: Response) => {
  let meeting: IMeeting;
  try {
    meeting = await fetchMeetingById(req.params.meetingId, true);
  } catch (err) {
    return res.status(err.code).send(err.msg);
  }

  try {
    meeting = await changeAttendanceStatus(
      req.user.id,
      meeting,
      AttendanceStatus.ABSENT,
      false
    );
  } catch (err) {
    return res.status(err.code).send(err.msg);
  }

  return res.send(meeting);
};

const changeAttendanceStatus = async (
  userId: string,
  meeting: IMeeting,
  newStatus: AttendanceStatus,
  voting: boolean
) => {
  if (meeting.status === MeetingStatus.ADJOURNED) {
    throw {
      code: 400,
      msg: 'Attendance can not be changed for an adjourned meeting.'
    };
  }

  const attendanceRecord = getMemberAttendanceRecord(userId, meeting);

  if (!attendanceRecord) {
    throw {
      code: 403,
      msg:
        'You must be listed as a member of the meeting to change your attendance.'
    };
  }

  attendanceRecord.status = newStatus;
  attendanceRecord.voting = voting;

  try {
    meeting = await meeting.save();
  } catch (err) {
    throw {
      code: 500,
      msg: 'Failed to change attendance on meeting.'
    };
  }

  return meeting;
};

/**
 * Gets the user's attendance record if they are a member of the meeting.
 * Will return undefined if they are not a member of the meeting.
 * @param userId the user ID to get
 * @param meeting the meeting in which to look for the user
 */
const getMemberAttendanceRecord = (userId: string, meeting: IMeeting) => {
  const maybeAttendanceRecord = meeting.attendanceRecords.filter(
    record => record.member.id === userId
  );
  return maybeAttendanceRecord.length ? maybeAttendanceRecord[0] : undefined;
};
