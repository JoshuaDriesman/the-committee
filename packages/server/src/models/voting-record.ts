import mongoose from 'mongoose';

import { AttendanceStatus, IAttendanceRecord } from './attendance-record';
import { IMotion } from './motion';
import { IUser } from './user';

/**
 * Represents a single instance of a vote on a motion.
 */

export enum VoteState {
  ABSTAIN = 'abstain',
  YES = 'yes',
  NO = 'no',
  PENDING = 'pending'
}

export interface IVote extends mongoose.Document {
  member: IUser;
  voteState: VoteState;
}

export const VoteSchema = new mongoose.Schema({
  member: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true },
  voteState: {
    type: String,
    required: true,
    enum: [VoteState.ABSTAIN, VoteState.YES, VoteState.NO, VoteState.PENDING]
  }
});

export const Vote = mongoose.model<IVote>('Vote', VoteSchema);

export interface IVotingRecord extends mongoose.Document {
  motion: IMotion;
  votes: IVote[];
}

export const VotingRecordSchema = new mongoose.Schema({
  motion: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Motion',
    required: true
  },
  votes: { type: [VoteSchema], required: true }
});

const VotingRecord = mongoose.model<IVotingRecord>(
  'VotingRecord',
  VotingRecordSchema
);

export default VotingRecord;

/**
 * Fetches the voting record with the given ID.
 * If there is an error, throws an error object with an HTTP status code (code) and a message (msg);
 * @param votingRecordId the ID of the voting record to retrieve
 */
export const fetchVotingRecordById = async (votingRecordId: string) => {
  let votingRecord: IVotingRecord;
  try {
    votingRecord = await VotingRecord.findById(votingRecordId);
  } catch (err) {
    throw {
      code: 500,
      msg: `There was a problem fetching voting record with the ID ${votingRecordId}`
    };
  }

  if (!votingRecord) {
    throw {
      code: 404,
      msg: `Could not find a voting record with the ID ${votingRecordId}`
    };
  }

  return votingRecord;
};

/**
 * Generates a new voting record based on the voting and present members listed in the array of attendance records.
 * @param attendanceRecord The array of attendance records from which to generate the voting record
 * @param motion The motion which the new voting record is being created for
 */
export const createVotingRecordFromAttendanceRecord = async (
  attendanceRecords: IAttendanceRecord[],
  motion: IMotion
) => {
  const votes = new Array<IVote>();

  attendanceRecords.forEach(record => {
    if (record.status === AttendanceStatus.PRESENT && record.voting) {
      const vote = new Vote({
        member: record.member,
        voteState: VoteState.PENDING
      });
      votes.push(vote);
    }
  });

  let votingRecord = new VotingRecord({
    motion,
    votes
  });

  try {
    votingRecord = await votingRecord.save();
  } catch (err) {
    throw {
      code: 500,
      msg: 'Error saving new voting record'
    };
  }

  return votingRecord;
};
