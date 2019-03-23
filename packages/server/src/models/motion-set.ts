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

/**
 * Retrieves the motion set with the given ID.
 * Checks for errors and empty results.
 * Throws controller friendly error if an issue occurs.
 * @param motionSetId the ID of the motion set to retrieve
 */
export const fetchMotionSetById = async (motionSetId: string) => {
  let motionSet;
  try {
    motionSet = await MotionSet.findById(motionSetId);
  } catch (err) {
    throw {
      msg: `Error retrieving motion set with ID: ${motionSetId}`,
      code: 500
    };
  }

  if (!motionSet) {
    throw {
      msg: `No motion set with the ID: ${motionSetId}`,
      code: 404
    };
  }

  return motionSet;
};
