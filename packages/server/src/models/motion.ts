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
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn'
}
export interface IMotion extends mongoose.Document {
  motionType: IMotionType;
  owner: IUser;
  motionStatus: MotionStatus;
  dateTimeMade: Date;
  userFriendlyId: number;
  userFriendlyName: string;
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
      MotionStatus.TABLED,
      MotionStatus.WITHDRAWN
    ]
  },
  dateTimeMade: { type: Date, required: true },
  userFriendlyId: { type: Number, required: true }, // Only unique within meetings
  userFriendlyName: String,
  secondedBy: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User'
  },
  effects: { type: mongoose.SchemaTypes.ObjectId, ref: 'Motion' }
});

const Motion = mongoose.model<IMotion>('Motion', MotionSchema);

export default Motion;

export const fetchMotionById = async (motionId: string) => {
  let motion: IMotion;
  try {
    motion = await Motion.findById(motionId)
      .populate('motionType')
      .populate('owner', { password: 0 })
      .populate('secondedBy', { password: 0 })
      .exec();
  } catch (err) {
    throw {
      code: 500,
      msg: `Could not retrieve the motion with ID ${motionId}`
    };
  }

  if (!motion) {
    throw {
      code: 404,
      msg: `No motion exists with the ID ${motionId}`
    };
  }

  return motion;
};
