import { Request, Response } from "express";

import generateAndSaveDefaultMotionSet from "../utils/default-motion-set";

export const generateDefaultMotionTypes = async (req: Request, res: Response) => {
  let savedMotions;
  try {
    savedMotions = await generateAndSaveDefaultMotionSet(req.user);
  } catch (err) {
    return res.status(500).send(`Failed to create default motion set for user with ID ${req.user.id}`);
  }

  return res.status(201).send(savedMotions);
}
