import { Request, Response } from 'express';

import MotionType from "../models/motion-type";
import generateAndSaveDefaultMotionSet from '../utils/default-motion-set';

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

export const generateDefaultMotionTypes = async (req: Request, res: Response) => {
  let savedMotions;
  try {
    savedMotions = await generateAndSaveDefaultMotionSet(req.user);
  } catch (err) {
    return res.status(500).send(`Failed to create default motion types for user with ID ${req.user.id}`);
  }

  return res.status(201).send(savedMotions);
}