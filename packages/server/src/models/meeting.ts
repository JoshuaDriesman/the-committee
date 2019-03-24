import mongoose from 'mongoose';

import { IAttendanceRecord } from './attendance-record';
import { IMotion } from './motion';
import { IMotionType } from './motion-type';
import { IUser } from './user';

/**
 * Represents a single instance of a meeting.
 */

export enum MeetingStatus {
  IN_PROGRESS = 'in-progress',
  ADJOURNED = 'adjourned'
}

export interface IMeeting extends mongoose.Document {
  name: string;
  motionSet: IMotionType[];
  pendingMotions: IMotion[];
  motionHistory: IMotion[];
  motionQueue: IMotion[];
  chair: IUser;
  status: MeetingStatus;
  startDateTime: Date;
  endDateTime: Date;
}

export const MeetingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  motionSet: [
    { type: mongoose.SchemaTypes.ObjectId, ref: 'MotionType', required: true }
  ],
  pendingMotions: [
    { type: mongoose.SchemaTypes.ObjectId, ref: 'Motion', required: true }
  ],
  motionHistory: [
    { type: mongoose.SchemaTypes.ObjectId, ref: 'Motion', required: true }
  ],
  motionQueue: [
    { type: mongoose.SchemaTypes.ObjectId, ref: 'Motion', required: true }
  ],
  attendanceRecord: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'AttendanceRecord'
  },
  chair: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    required: true,
    enum: [MeetingStatus.IN_PROGRESS, MeetingStatus.ADJOURNED]
  },
  startDateTime: { type: Date, required: true },
  endDateTime: Date
});

const Meeting = mongoose.model<IMeeting>('Meeting', MeetingSchema);

export default Meeting;
