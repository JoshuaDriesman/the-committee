import { Request, Response } from 'express';

import Roster, { fetchRosterById, IRoster } from '../models/roster';
import User, { fetchUserById, IUser } from '../models/user';

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

  let owner: IUser;
  try {
    owner = await fetchUserById(req.body.ownerId);
  } catch (err) {
    return res.status(err.resCode).send(err.error);
  }

  let members: IUser[];
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
    return res.status(201).send(savedRoster);
  } catch (err) {
    return res.status(500).send('Could not save roster');
  }
};

export const deleteRoster = async (req: Request, res: Response) => {
  const rosterId = req.params.rosterId;

  let roster: IRoster;
  try {
    roster = await fetchRosterById(rosterId);
  } catch (err) {
    return res.status(err.resCode).send(err.error);
  }

  if (req.user.id !== roster.owner.id) {
    return res.status(403).send('You cannot modify a roster you do not own.');
  }

  try {
    await Roster.deleteOne({ _id: rosterId });
  } catch (err) {
    return res.status(500).send(`Error deleting roster with ID ${rosterId}`);
  }

  return res.send(true);
};

export const addMemberByEmail = async (req: Request, res: Response) => {
  const rosterId = req.params.rosterId;
  const memberEmail = req.params.memberEmail;

  let roster: IRoster;
  try {
    roster = await fetchRosterById(rosterId);
  } catch (err) {
    return res.status(err.resCode).send(err.error);
  }

  if (req.user.id !== roster.owner.id) {
    return res.status(403).send('You cannot modify a roster you do not own.');
  }

  let newMember: IUser;
  try {
    newMember = await User.findOne({ email: memberEmail }, { _id: 1 }).exec();
  } catch (err) {
    return res.status(500).send('Could not retrieve specified member.');
  }

  if (!newMember) {
    return res
      .status(404)
      .send(`New member with email ${memberEmail} does not exist`);
  }

  if (roster.members.indexOf(newMember.id) === -1) {
    roster.members.push(newMember);
  }

  let updatedRoster: IRoster;
  try {
    updatedRoster = await roster.save();
  } catch (err) {
    return res.status(500).send('Error updating roster.');
  }

  return res.send(updatedRoster);
};

export const removeMemberByEmail = async (req: Request, res: Response) => {
  const rosterId = req.params.rosterId;
  const memberEmail = req.params.memberEmail;

  let roster: IRoster;
  try {
    roster = await fetchRosterById(rosterId);
  } catch (err) {
    return res.status(err.resCode).send(err.error);
  }

  if (req.user.id !== roster.owner.id) {
    return res.status(403).send('You cannot modify a roster you do not own.');
  }

  roster.members = roster.members.filter(v => v.email !== memberEmail);

  let updatedRoster: IRoster;
  try {
    updatedRoster = await roster.save();
  } catch (err) {
    return res.status(500).send('Error updating roster.');
  }

  return res.send(updatedRoster);
};

export const getRoster = async (req: Request, res: Response) => {
  const rosterId = req.params.rosterId;

  let roster: IRoster;
  try {
    roster = await fetchRosterById(rosterId);
  } catch (err) {
    return res.status(err.resCode).send(err.error);
  }

  return res.send(roster);
};
