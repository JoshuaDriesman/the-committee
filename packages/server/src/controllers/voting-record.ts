import { Request, Response } from 'express';

import { fetchMeetingById, IMeeting, MeetingStatus } from '../models/meeting';
import { fetchMotionById, IMotion, MotionStatus } from '../models/motion';
import {
  createVotingRecordFromAttendanceRecord,
  VoteState,
  fetchVotingRecordById
} from '../models/voting-record';
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

export const endVotingProcedure = async (req: Request, res: Response) => {
  req.assert('meetingId').notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }

  let meeting: IMeeting;
  try {
    meeting = await fetchMeetingById(req.body.meetingId, true);
  } catch (err) {
    res.status(err.code).send(err.msg);
  }

  if (req.user.id !== meeting.chair.id) {
    return res
      .status(403)
      .send('Must be owner of meeting to end voting procedure.');
  }

  if (!meeting.activeVotingRecord) {
    res.status(400).send('No active voting procedure for given meeting.');
  }

  meeting.activeVotingRecord = null;

  try {
    meeting = await meeting.save();
  } catch (err) {
    res.status(500).send('Could not save meeting with ended voting record.');
  }

  return res.send(meeting);
};

export const setVoteState = async (req: Request, res: Response) => {
  req.assert('meetingId').notEmpty();
  req
    .assert('voteState')
    .notEmpty()
    .isString();

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

  if (!meeting.activeVotingRecord) {
    return res.status(400).send('No vote in progress for given meeting.');
  }

  let votingRecord: IVotingRecord;
  try {
    votingRecord = await fetchVotingRecordById(meeting.activeVotingRecord.id);
  } catch (err) {
    return res.status(err.code).send(err.msg);
  }

  const maybeVote = votingRecord.votes.filter(v => v.member.id === req.user.id);

  if (maybeVote.length !== 1) {
    return res.status(400).send('No voting record for user');
  }

  const voteStr = req.body.voteState;
  let newVoteState: VoteState;
  // Maybe there is a better way to do this, but this all needs refactoring anyways
  if (voteStr === 'yes') {
    newVoteState = VoteState.YES;
  } else if (voteStr === 'no') {
    newVoteState = VoteState.NO;
  } else if (voteStr === 'abstain') {
    newVoteState = VoteState.ABSTAIN;
  } else {
    return res
      .status(400)
      .send("Vote state must be one of 'yes', 'no', or 'abstain'");
  }

  maybeVote[0].voteState = newVoteState;

  try {
    await votingRecord.save();
    meeting = await fetchMeetingById(meeting.id, true);
  } catch (err) {
    return res.status(500).send('Error saving new voting state');
  }

  return res.send(meeting);
};
