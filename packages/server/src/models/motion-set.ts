import mongoose from 'mongoose';
import { IMotionType } from './motion-type';
import { IUser } from './user';

/**
 * A simple object that represents a set of motion types for a meeting.
 */

export interface IMotionSet extends mongoose.Document {
  name: string;
  owner: IUser;
  motionTypes: IMotionType[];
}

export const MotionSetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true },
  motionTypes: [
    { type: mongoose.SchemaTypes.ObjectId, ref: 'MotionType', required: true }
  ]
});

const MotionSet = mongoose.model<IMotionSet>('MotionSet', MotionSetSchema);

export default MotionSet;
