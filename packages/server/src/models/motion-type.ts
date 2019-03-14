/**
 * A MotionType defines a kind of motion, for example "Motion to adjourn".
 * These motions make up the rule set for the meeting.
 */
import mongoose from 'mongoose';

export enum MotionClass {
  MAIN = 'main',
  SUBSIDIARY = 'subsidiary',
  PRIVILEGED = 'privileged',
  INCIDENTAL = 'incidental'
}

export enum VotingThreshold {
  MAJORITY = 'majority',
  TWO_THIRDS = 'two-thirds'
}

export interface IMotionType extends mongoose.Document {
  name: string;
  motionType: MotionClass;
  description: string;
  precedence: number;
  requiresSecond: boolean;
  debatable: boolean;
  amendable: boolean;
  votingType: VotingThreshold;
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
  debatable: { type: Boolean, required: true },
  amendable: { type: Boolean, required: true }
});

const MotionType = mongoose.model<IMotionType>(
  'MotionType',
  MotionTypeSchema
);

export default MotionType;
