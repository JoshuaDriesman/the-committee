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
  }
});

const MotionType = mongoose.model<IMotionType>('MotionType', MotionTypeSchema);

export default MotionType;
