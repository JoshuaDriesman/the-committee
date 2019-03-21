/**
 * A motion represents an instance of a user making a motion that is defined 
 * by a MotionType in the meeting rule set.
 */
import mongoose from 'mongoose';
import { IMotionType } from './motion-type';
import { IUser } from './user';

export interface IMotion extends mongoose.Document {
  motionType: IMotionType;
  owner: IUser;
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
  secondedBy: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true
  },
  effects: { type: mongoose.SchemaTypes.ObjectId, ref: 'Motion' }
});

const Motion = mongoose.model<IMotion>('Motion', MotionSchema);

export default Motion;
