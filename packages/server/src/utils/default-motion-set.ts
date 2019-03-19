import MotionType, { Debatable, MotionClass } from '../models/motion-type';
import { VotingThreshold } from '../models/motion-type';
import { IUserModel } from '../models/user';

/**
 * Represents the default set of motions available.
 * This is a temporary measure until full motion sets are available.
 */
const DEFAULT_MOTIONS = [
  {
    name: 'Main Motion',
    motionType: MotionClass.MAIN,
    description: 'Sets the main issue to be placed in front of the body.',
    precedence: 1,
    requiresSecond: true,
    debatable: Debatable.YES,
    amendable: true,
    interrupts: false,
    votingType: VotingThreshold.MAJORITY
  },
  {
    name: 'Motion to Amend',
    motionType: MotionClass.SUBSIDIARY,
    description: 'Amends any amendable motion.',
    precedence: 6,
    requiresSecond: true,
    debatable: Debatable.YES,
    amendable: true,
    interrupts: false,
    votingType: VotingThreshold.MAJORITY
  },
  {
    name: 'Motion to Close Debate',
    motionType: MotionClass.SUBSIDIARY,
    description:
      'Ends debate on the current motion and begin voting procedure.',
    precedence: 2,
    requiresSecond: true,
    debatable: Debatable.NO,
    amendable: false,
    interrupts: false,
    votingType: VotingThreshold.TWO_THIRDS
  },
  {
    name: 'Motion to Limit Debate',
    motionType: MotionClass.SUBSIDIARY,
    description: 'Limit or extend debate on a motion.',
    precedence: 3,
    requiresSecond: true,
    debatable: Debatable.LIMITED,
    amendable: false,
    interrupts: false,
    votingType: VotingThreshold.TWO_THIRDS
  },
  {
    name: 'Point of Parliamentary Inquiry',
    motionType: MotionClass.INCIDENTAL,
    description: 'Request for clarification of parliamentary procedure.',
    precedence: 0,
    requiresSecond: false,
    debatable: Debatable.NO,
    amendable: false,
    interrupts: true,
    votingType: VotingThreshold.NA
  }
];

const generateAndSaveDefaultMotionSet = (owner: IUserModel) => {
  DEFAULT_MOTIONS.forEach(async (motionTemplate) => {
    const completeMotion = Object.assign({}, motionTemplate, { owner })
    const motionType = new MotionType(completeMotion);
    motionType.save();
  });
}

export default generateAndSaveDefaultMotionSet;