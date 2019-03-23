import { Request, Response } from "express";

import Meeting, { IMeeting, MeetingStatus } from "../models/meeting";
import { IMotion } from "../models/motion";
import { fetchRosterById, IRoster } from "../models/roster";
import { fetchUserById, IUser } from "../models/user";

/**
 * Controller for meeting functionality.
 */

export const startMeeting = async (req: Request, res: Response) => {
  req.assert('name', 'Meeting name is required').notEmpty();
  req.assert('rosterId', 'Roster ID is required').notEmpty();
  req.assert('motionSetId', 'Motion set ID is required').notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }

  let roster : IRoster;
  try {
    roster = await fetchRosterById(req.body.rosterId);
  } catch (err) {
    return res.status(err.resCode).send(err.error);
  }

  let chair : IUser;
  try {
    chair = await fetchUserById(req.user);
  } catch (err) {
    return res.status(err.resCode).send(err.error);
  }

  const meeting = new Meeting({
    name: req.body.name,
    pendingMotions: new Array<IMotion>(),
    motionHistory: new Array<IMotion>(),
    motionQueue: new Array<IMotion>(),
    roster,
    chair,
    status: MeetingStatus.IN_PROGRESS,
    startDateTime: new Date()
  });

  let savedMeeting : IMeeting;
  try {
    savedMeeting = await meeting.save();
  } catch (err) {
    return res.status(500).send('Error starting the meeting.');
  }

  return res.send(savedMeeting);
}