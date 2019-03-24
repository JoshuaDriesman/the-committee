/**
 * A motion represents an instance of a user making a motion that is defined
 * by a MotionType in the meeting rule set.
 */
import mongoose from 'mongoose';
import { IMotionType } from './motion-type';
import { IUser } from './user';

export enum MotionStatus {
  TABLED = 'tabled',
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}
export interface IMotion extends mongoose.Document {
  motionType: IMotionType;
  owner: IUser;
  motionStatus: MotionStatus;
  secondedBy?: IUser;
  effects?: IMotion;
}

export const MotionSchema = new mongoose.Schema({
  motionType: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'MotionType',
    required: true
  },
  owner: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true },
  motionStatus: {
    type: String,
    required: true,
    enum: [
      MotionStatus.ACCEPTED,
      MotionStatus.PENDING,
      MotionStatus.REJECTED,
      MotionStatus.TABLED
    ]
  },
  secondedBy: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true
  },
  effects: { type: mongoose.SchemaTypes.ObjectId, ref: 'Motion' }
});

const Motion = mongoose.model<IMotion>('Motion', MotionSchema);

export default Motion;
