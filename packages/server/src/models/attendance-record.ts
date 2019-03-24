import mongoose from 'mongoose';

import { IRoster } from './roster';
import { IUser } from './user';

/**
 * Records attendance for a single member.
 */

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  EXCUSED = 'excused'
}

export interface IAttendanceRecord extends mongoose.Document {
  member: IUser;
  status: AttendanceStatus;
  voting: boolean;
}

export const AttendanceRecordSchema = new mongoose.Schema({
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

export const AttendanceRecord = mongoose.model<IAttendanceRecord>(
  'AttendanceRecord',
  AttendanceRecordSchema
);

/**
 * Generates an AttendanceRecord with every user on the given roster
 * and associates it with the given meeting. The record's rows are
 * marked as not voting and absent initially.
 * @param roster the roster to use for populating the attendance record
 */
export const initializeAttendanceRecordFromRoster = (roster: IRoster) => {
  const attendanceRecords = new Array<IAttendanceRecord>();

  roster.members.forEach(member => {
    const row = new AttendanceRecord({
      member,
      status: AttendanceStatus.ABSENT,
      voting: false
    });
    attendanceRecords.push(row);
  });

  return attendanceRecords;
};
