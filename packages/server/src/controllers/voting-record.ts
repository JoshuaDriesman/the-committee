import { Request, Response } from 'express';

import { fetchMeetingById, IMeeting, MeetingStatus } from '../models/meeting';
import { fetchMotionById, IMotion, MotionStatus } from '../models/motion';
import { createVotingRecordFromAttendanceRecord } from '../models/voting-record';
import { IVotingRecord } from '../models/voting-record';

/**
 * Endpoints for starting, conducting, and ending voting procedure.
 */

export const beginVotingProcedure = async (req: Request, res: Response) => {
  req.assert('motionId').notEmpty();
  req.assert('meetingId').notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }

  let meeting: IMeeting;
  try {
    meeting = await fetchMeetingById(req.body.meetingId, true);
  } catch (err) {
    return res.status(err.code).send(err.msg);
  }

  if (req.user.id !== meeting.chair.id) {
    return res
      .status(403)
      .send('You must be chair of the meeting to start a vote.');
  }

  if (meeting.status === MeetingStatus.ADJOURNED) {
    return res
      .status(400)
      .send('Can not start voting procedure on a meeting that is adjourned.');
  }

  if (meeting.activeVotingRecord) {
    return res.status(400).send('Meeting already has a vote in progress.');
  }

  let motion: IMotion;
  try {
    motion = await fetchMotionById(req.body.motionId);
  } catch (err) {
    return res.status(err.code).send(err.msg);
  }

  if (motion.motionStatus !== MotionStatus.PENDING) {
    return res
      .status(400)
      .send('Can not vote on motion that is not actively pending.');
  }

  const meetingMotionIds = meeting.pendingMotions.map(m => m.id);
  if (!meetingMotionIds.includes(motion.id)) {
    return res.status(400).send('Motion must be part of the current meeting.');
  }

  let votingRecord: IVotingRecord;
  try {
    votingRecord = await createVotingRecordFromAttendanceRecord(
      meeting.attendanceRecords,
      motion
    );
  } catch (err) {
    return res.status(err.code).send(err.msg);
  }

  meeting.activeVotingRecord = votingRecord;

  try {
    meeting = await meeting.save();
  } catch (err) {
    return res
      .status(500)
      .send('Error saving meeting with new active voting record.');
  }

  return res.send(votingRecord);
};
