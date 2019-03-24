import mongoose from 'mongoose';

import { IMeeting } from './meeting';
import { IRoster } from './roster';
import { IUser } from './user';

/**
 * Records attendance based on a roster and a specific meeting instance.
 */

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  EXCUSED = 'excused'
}

export interface IAttendanceRow extends mongoose.Document {
  member: IUser;
  status: AttendanceStatus;
  voting: boolean;
}

export const AttendanceRowSchema = new mongoose.Schema({
  member: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    required: true,
    enum: [
      AttendanceStatus.ABSENT,
      AttendanceStatus.EXCUSED,
      AttendanceStatus.PRESENT
    ]
  },
  voting: { type: Boolean, required: true }
});

export interface IAttendanceRecord extends mongoose.Document {
  records: IAttendanceRow[];
}

export const AttendanceRecordSchema = new mongoose.Schema({
  records: [AttendanceRowSchema]
});

export const AttendanceRow = mongoose.model<IAttendanceRow>(
  'AttendanceRow',
  AttendanceRowSchema
);

const AttendanceRecord = mongoose.model<IAttendanceRecord>(
  'AttendanceRecord',
  AttendanceRecordSchema
);

export default AttendanceRecord;

/**
 * Generates an AttendanceRecord with every user on the given roster
 * and associates it with the given meeting. The record's rows are
 * marked as not voting and absent initially.
 * @param roster the roster to use for populating the attendance record
 */
export const initializeAttendanceRecordFromRoster = async (roster: IRoster) => {
  const attendanceRecord = new AttendanceRecord({
    records: []
  });

  roster.members.forEach(member => {
    const row = new AttendanceRow({
      member,
      status: AttendanceStatus.ABSENT,
      voting: false
    });
    attendanceRecord.records.push(row);
  });

  let savedRecord;
  try {
    savedRecord = await attendanceRecord.save();
  } catch (err) {
    throw err;
  }

  return savedRecord;
};
