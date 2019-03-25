/**
 * A MotionType defines a kind of motion, for example "Motion to adjourn".
 * These motions make up the rule set for the meeting.
 */
import mongoose from 'mongoose';
import { IUser } from './user';

export enum MotionClass {
  MAIN = 'main',
  SUBSIDIARY = 'subsidiary',
  PRIVILEGED = 'privileged',
  INCIDENTAL = 'incidental'
}

export enum VotingThreshold {
  MAJORITY = 'majority',
  TWO_THIRDS = 'two-thirds',
  NA = 'not-applicable'
}

export enum Debatable {
  YES = 'yes',
  NO = 'no',
  LIMITED = 'limited'
}

export interface IMotionType extends mongoose.Document {
  name: string;
  motionType: MotionClass;
  description: string;
  // Precedence represents the motion's precedence within its own class of motions. 1 is the highest precedence. 0 represents N/A.
  precedence: number;
  requiresSecond: boolean;
  debatable: Debatable;
  amendable: boolean;
  interrupts: boolean;
  votingType: VotingThreshold;
  owner: IUser;
}

export const MotionTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  motionType: {
    type: String,
    required: true,
    enum: [
      MotionClass.MAIN,
      MotionClass.INCIDENTAL,
      MotionClass.PRIVILEGED,
      MotionClass.SUBSIDIARY
    ]
  },
  description: { type: String },
  precedence: { type: Number, required: true },
  requiresSecond: { type: Boolean, required: true },
  debatable: {
    type: String,
    required: true,
    enum: [Debatable.YES, Debatable.NO, Debatable.LIMITED]
  },
  amendable: { type: Boolean, required: true },
  interrupts: { type: Boolean, required: true },
  votingType: {
    type: String,
    required: true,
    enum: [
      VotingThreshold.MAJORITY,
      VotingThreshold.TWO_THIRDS,
      VotingThreshold.NA
    ]
  },
  owner: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true }
});

const MotionType = mongoose.model<IMotionType>('MotionType', MotionTypeSchema);

export default MotionType;

/**
 * Retrieves the motion type with the given ID.
 * @param motionTypeId the ID of the motion type to retrieve
 */
export const fetchMotionTypeById = async (motionTypeId: string) => {
  let motionType: IMotionType;
  try {
    motionType = await MotionType.findById(motionTypeId);
  } catch (err) {
    throw {
      code: 500,
      msg: `Could not retrieve motion type with ID ${motionTypeId}`
    };
  }

  if (!motionType) {
    throw {
      code: 404,
      msg: `No motion type with the ID ${motionTypeId}`
    };
  }

  return motionType;
};
