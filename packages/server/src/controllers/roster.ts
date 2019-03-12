import { Request, Response, response } from 'express';

import Roster, { IRosterModel } from '../models/roster';
import User, { IUserModel } from '../models/user';
import { getUserFromAuthHeader } from '../utils/user-auth';

export const createRoster = async (req: Request, res: Response) => {
  req.assert('name', 'Roster name is required.').notEmpty();
  req.assert('ownerId', 'Owner ID is required.').notEmpty();
  req.assert('memberIds', 'Member IDs must be an array').isArray();
  req
    .assert('quorum', 'Quorum threshold is required and must be a number.')
    .notEmpty()
    .isNumeric();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }

  let owner: IUserModel;
  try {
    owner = await User.findById(req.body.ownerId, { password: 0 });
  } catch (err) {
    return res.status(500).send('Issue getting owner for roster.');
  }

  let members: IUserModel[];
  try {
    members = await User.find(
      { _id: { $in: req.body.memberIds } },
      { password: 0 }
    );
  } catch (err) {
    return res
      .status(500)
      .send('Issue getting one or more of the members for the roster.');
  }

  if (!owner) {
    return res.status(404).send('Owner for the roster does not exist.');
  }

  if (members.length !== req.body.memberIds.length) {
    return res
      .status(404)
      .send(
        'One or more of the members given do not exist, or there is a duplicate member.'
      );
  }

  const newRoster = new Roster({
    name: req.body.name,
    owner,
    members,
    quorum: req.body.quorum
  });

  try {
    const savedRoster = await newRoster.save();
    return res.send(savedRoster);
  } catch (err) {
    return res.status(500).send('Could not save roster');
  }
};

export const addMemberByEmail = async (req: Request, res: Response) => {
  const rosterId = req.params.rosterId;
  const memberEmail = req.params.memberEmail;

  let roster: IRosterModel;
  try {
    roster = await Roster.findById(rosterId)
      .populate('owner')
      .exec();
  } catch (err) {
    return res.status(500).send('Could not retrieve specified roster.');
  }

  if (!roster) {
    return res.status(404).send(`No roster with ID ${rosterId}`);
  }

  if (req.user.id !== roster.owner.id) {
    return res.status(403).send('You cannot modify a roster you do not own.');
  }

  let newMember: IUserModel;
  try {
    newMember = await User.findOne({ email: memberEmail }, { _id: 1 }).exec();
  } catch (err) {
    return res.status(500).send('Could not retrieve specified member.');
  }

  if (!newMember) {
    return res.status(404).send(`New member with email ${memberEmail}`);
  }

  roster.members.push(newMember.id);

  let updatedRoster: IRosterModel;
  try {
    updatedRoster = await roster.save();
  } catch (err) {
    return res.status(500).send('Error updating roster.');
  }

  return res.send(updatedRoster);
};

export const getRoster = async (req: Request, res: Response) => {
  const rosterId = req.params.rosterId;

  let roster: IRosterModel;
  try {
    roster = await Roster.findById(rosterId)
      .populate('owner', { password: 0 })
      .populate('members.list', { password: 0 })
      .exec();
  } catch (acc) {
    return res.status(500).send(`Issue getting the roster with ID ${rosterId}`);
  }

  if (!roster) {
    return res.status(404).send(`Could not find roster with ID ${rosterId}`);
  }

  return res.send(roster);
};
