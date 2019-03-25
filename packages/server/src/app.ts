import bodyParser from 'body-parser';
import compression from 'compression';
import express, { Request, Response } from 'express';
import expressValidator from 'express-validator';
import mongoose from 'mongoose';

import serverConfig from './config/server';
import { isAuthenticated } from './utils/user-auth';

import {
  adjournMeeting,
  getMeeting,
  startMeeting,
  joinMeeting,
  leaveMeeting
} from './controllers/meeting';
import { generateDefaultMotionTypes } from './controllers/motion-set';
import { getMotionTypeForUser } from './controllers/motion-type';
import {
  addMemberByEmail,
  createRoster,
  deleteRoster,
  getRoster,
  removeMemberByEmail
} from './controllers/roster';
import { getUser, getUserByEmail, login, register } from './controllers/user';
import { makeMotion } from './controllers/motion';

const dbConn = mongoose.connect('mongodb://localhost/the-committee', {
  useNewUrlParser: true
});

const app = express();

app.set('port', process.env.PORT || serverConfig.port);

app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ type: 'application/json' }));
app.use(expressValidator());

app.get('/', (req: Request, res: Response) => {
  res.send(`Up and running as of ${new Date().toISOString()}`);
});

app.post('/user/register', register);
app.post('/user/login', login);
app.get('/user/:userId', isAuthenticated, getUser);
app.get('/user/byEmail/:email', isAuthenticated, getUserByEmail);

app.post('/roster', isAuthenticated, createRoster);
app.delete('/roster/:rosterId', isAuthenticated, deleteRoster);
app.put(
  '/roster/:rosterId/addMemberByEmail/:memberEmail',
  isAuthenticated,
  addMemberByEmail
);
app.delete(
  '/roster/:rosterId/removeMemberByEmail/:memberEmail',
  isAuthenticated,
  removeMemberByEmail
);
app.get('/roster/:rosterId', isAuthenticated, getRoster);

app.get('/motionType', isAuthenticated, getMotionTypeForUser);

app.post(
  '/motionSet/createDefault',
  isAuthenticated,
  generateDefaultMotionTypes
);

// General meeting endpoints
app.post('/meeting/start', isAuthenticated, startMeeting);
app.get('/meeting/:meetingId', isAuthenticated, getMeeting);

// Chair meeting endpoints
app.patch('/meeting/:meetingId/chair/adjourn', isAuthenticated, adjournMeeting);

// Participant meeting endpoints
app.patch('/meeting/:meetingId/participant/join', isAuthenticated, joinMeeting);
app.patch(
  '/meeting/:meetingId/participant/leave',
  isAuthenticated,
  leaveMeeting
);

app.post('/motion', isAuthenticated, makeMotion);

export default app;
