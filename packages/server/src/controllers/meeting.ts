import { Request, Response } from 'express';

import {
  IAttendanceRecord,
  initializeAttendanceRecordFromRoster
} from '../models/attendance-record';
import Meeting, {
  fetchMeetingById,
  IMeeting,
  MeetingStatus
} from '../models/meeting';
import Motion, { IMotion } from '../models/motion';
import { fetchMotionSetById, IMotionSet } from '../models/motion-set';
import { fetchRosterById, IRoster } from '../models/roster';
import { fetchUserById, IUser } from '../models/user';

/**
 * Controller for meeting functionality.
 */

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

  let attendanceRecord: IAttendanceRecord;
  try {
    attendanceRecord = await initializeAttendanceRecordFromRoster(roster);
  } catch (err) {
    return res
      .status(500)
      .send('There was an error creating an attendance record.');
  }

  let chair: IUser;
  try {
    chair = await fetchUserById(req.user);
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
    attendanceRecord,
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

export const getMeeting = async (req: Request, res: Response) => {
  // tslint:disable:no-unused-expression
  new Motion({}); // This is a really stupid hack to get the model to initialize if there are none

  let meeting: IMeeting;
  try {
    meeting = await fetchMeetingById(req.params.meetingId, true);
  } catch (err) {
    return res.status(err.code).send(err.msg);
  }

  return res.send(meeting);
};
