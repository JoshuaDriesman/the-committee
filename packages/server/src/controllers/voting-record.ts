import { Request, Response } from 'express';

import { fetchMeetingById, IMeeting, MeetingStatus } from '../models/meeting';
import { fetchMotionById, IMotion, MotionStatus } from '../models/motion';
import { VotingThreshold } from '../models/motion-type';
import {
  createVotingRecordFromAttendanceRecord,
  fetchVotingRecordById,
  VoteState
} from '../models/voting-record';
import { IVotingRecord } from '../models/voting-record';

/**
 * Endpoints for starting, conducting, and ending voting procedure.
 */

export const beginVotingProcedure = async (req: Request, res: Response) => {
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

  if (meeting.pendingMotions.length === 0) {
    return res.status(400).send('No motions to vote on');
  }

  let motion: IMotion;
  try {
    motion = await fetchMotionById(meeting.pendingMotions.pop().id);
  } catch (err) {
    return res.status(err.code).send(err.msg);
  }
  meeting.pendingMotions.push(motion);

  if (motion.motionStatus !== MotionStatus.PENDING) {
    return res
      .status(400)
      .send('Can not vote on motion that is not actively pending.');
  }

  if (motion.motionType.votingType === VotingThreshold.NA) {
    return res.status(400).send('Motion does not require a vote.');
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
    return res
      .status(400)
      .send('No active voting procedure for given meeting.');
  }

  let votingRecord: IVotingRecord;
  try {
    votingRecord = await fetchVotingRecordById(meeting.activeVotingRecord.id);
  } catch (err) {
    return res.status(err.code).send(err.msg);
  }

  let motion: IMotion;
  try {
    motion = await fetchMotionById(votingRecord.motion.id);
  } catch (err) {
    res.status(500).send('Error getting motion.');
  }

  const totalVotes = votingRecord.votes.length;
  const voteCounts = countVotes(votingRecord);
  const checkVoteCounts = (threshold: number) => {
    if (voteCounts.yes > threshold) {
      return MotionStatus.ACCEPTED;
    } else if (voteCounts.yes < threshold) {
      return MotionStatus.REJECTED;
    } else {
      return MotionStatus.PENDING;
    }
  };

  if (motion.motionType.votingType === VotingThreshold.MAJORITY) {
    motion.motionStatus = checkVoteCounts(totalVotes / 2);
  } else if (motion.motionType.votingType === VotingThreshold.TWO_THIRDS) {
    motion.motionStatus = checkVoteCounts((totalVotes * 2) / 3);
  }

  try {
    motion = await motion.save();
  } catch (err) {
    return res.status(500).send('Could not save updated motion');
  }

  // In the case none of the above is true (in a tie)
  if (motion.motionStatus !== MotionStatus.PENDING) {
    meeting.pendingMotions.pop();
    meeting.motionHistory.push(motion);
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

const countVotes = (votingRecord: IVotingRecord) => {
  const countVotingTypes = (vt: VoteState) => {
    return votingRecord.votes.reduce((count, vote) => {
      if (vote.voteState === vt) {
        return count + 1;
      }
      return count;
    }, 0);
  };

  const no = countVotingTypes(VoteState.NO);

  const yes = countVotingTypes(VoteState.YES);

  const abstain =
    countVotingTypes(VoteState.ABSTAIN) + countVotingTypes(VoteState.PENDING);

  return {
    no,
    yes,
    abstain
  };
};
