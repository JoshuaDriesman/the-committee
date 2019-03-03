import { Request, Response } from 'express';

import Roster, { IRosterModel } from '../models/roster';

export const createRoster = async (req: Request, res: Response) => {
  req.assert('name', 'Roster name is required.').notEmpty();
  req.assert('ownerId', 'Owner ID is required.').notEmpty();
  req.assert('memberIds', 'Member IDs must be an array').isArray();
  req.assert('quorum', 'Quorum threshold is required and must be a number.').notEmpty().isNumeric();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }

  const newRoster = new Roster({
    name: req.body.name,
    ownerId: req.body.ownerId,
    memberIds: req.body.memberIds,
    quorum: req.body.quorum
  })
  try {
    const savedRoster = await newRoster.save();
    return res.send(savedRoster);
  } catch (err) {
    return res.status(500).send('Could not save roster');
  }
};
