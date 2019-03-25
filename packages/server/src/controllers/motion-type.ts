import { Request, Response } from 'express';

import MotionType from "../models/motion-type";

/**
 * Controller for motion types.
 */

export const getMotionTypeForUser = async (req: Request, res: Response) => {
  let motionTypes;
  try {
    motionTypes = await MotionType.find({ owner: req.user.id });
  } catch (err) {
    return res.status(500).send(`Issue getting motions for user with ID ${req.user.id}`)
  }

  if (motionTypes.length === 0) {
    return res.status(404).send('No motion types found for given user.')
  }

  return res.send(motionTypes);
}
