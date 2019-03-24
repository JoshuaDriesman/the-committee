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

/**
 * Fetches the meeting with the given ID
 * @param meetingId the ID of the meeting to fetch
 * @param populate whether or not to populate the meeting's sub-objects
 */
export const fetchMeetingById = async (
  meetingId: string,
  populate: boolean
) => {
  let meeting: IMeeting;
  try {
    if (populate) {
      meeting = await Meeting.findById(meetingId)
        .populate('motionSet')
        .populate('pendingMotions')
        .populate('motionHistory')
        .populate('motionQueue')
        .populate('chair')
        .exec();
    } else {
      meeting = await Meeting.findById(meetingId);
    }
  } catch (err) {
    throw {
      msg: `Error getting meeting with ID ${meetingId}`,
      code: 500
    };
  }

  if (!meeting) {
    throw {
      msg: `No meeting with ID ${meetingId}`,
      code: 404
    };
  }

  return meeting;
};
