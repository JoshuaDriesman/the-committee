import MotionSet from '../models/motion-set';
import MotionType, { Debatable, MotionClass } from '../models/motion-type';
import { VotingThreshold } from '../models/motion-type';
import { IUser } from '../models/user';

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
    name: 'Motion to Amend', // DO NOT CHANGE THIS NAME. It is required to check if motions are being amended correctly. See issue #5 for more info, this should be fixed.
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

/**
 * Generates a set of default motion types and saves them in the DB.
 * @param owner The user that will be the owner of each of the new motion types.
 */
const generateAndSaveDefaultMotionSet = async (owner: IUser) => {
  const resultingMotions = new Array();
  for (const motionTemplate of DEFAULT_MOTIONS) {
    const completeMotion = Object.assign({}, motionTemplate, { owner });
    const motionType = new MotionType(completeMotion);

    resultingMotions.push(await motionType.save());
  }

  const motionSet = new MotionSet({
    name: 'Default',
    owner,
    motionTypes: resultingMotions
  });

  let savedMotionSet;
  try {
    savedMotionSet = await motionSet.save();
  } catch (err) {
    throw err;
  }

  return savedMotionSet;
};

export default generateAndSaveDefaultMotionSet;
