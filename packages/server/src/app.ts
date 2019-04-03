import bodyParser from 'body-parser';
import compression from 'compression';
import express, { Request, Response } from 'express';
import expressValidator from 'express-validator';
import fs from 'fs';
import mongoose from 'mongoose';

import serverConfig from './config/server';
import { isAuthenticated } from './utils/user-auth';

import {
  adjournMeeting,
  getMeeting,
  getMeetingsByMember,
  joinMeeting,
  leaveMeeting,
  startMeeting
} from './controllers/meeting';
import { getMotion, makeMotion } from './controllers/motion';
import { generateDefaultMotionTypes } from './controllers/motion-set';
import { getMotionTypeForUser } from './controllers/motion-type';
import {
  addMemberByEmail,
  createRoster,
  deleteRoster,
  getRoster,
  removeMemberByEmail
} from './controllers/roster';
import {
  getCurrentUser,
  getUser,
  getUserByEmail,
  login,
  register
} from './controllers/user';
import {
  beginVotingProcedure,
  endVotingProcedure,
  setVoteState
} from './controllers/voting-record';

const pem: Readonly<string[]> = [
  fs.readFileSync(process.env.CA_LOCATION, {
    encoding: 'utf-8'
  })
];
const dbHost = process.env.MONGO_HOST;
const dbPwd = process.env.MONGO_PWD;

const dbConn = mongoose.connect(
  `mongodb://the-committee:${dbPwd}@${dbHost}/the-committee`,
  {
    useNewUrlParser: true,
    ssl: true,
    sslCA: pem
  }
);

const app = express();

app.set('port', process.env.PORT || serverConfig.port);

app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ type: 'application/json' }));
app.use(expressValidator());

app.use((req, res, next) => {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'content-type,authorization');

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

  // Pass to next layer of middleware
  next();
});

app.get('/', (req: Request, res: Response) => {
  res.send(`Up and running as of ${new Date().toISOString()}`);
});

app.post('/user/register', register);
app.post('/user/login', login);
app.get('/user/:userId', isAuthenticated, getUser);
app.get('/user/byEmail/:email', isAuthenticated, getUserByEmail);
app.get('/user', isAuthenticated, getCurrentUser);

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
app.get('/meetingByMember', isAuthenticated, getMeetingsByMember);
app.patch('/meeting/:meetingId/participant/join', isAuthenticated, joinMeeting);
app.patch(
  '/meeting/:meetingId/participant/leave',
  isAuthenticated,
  leaveMeeting
);

app.post('/motion', isAuthenticated, makeMotion);
app.get('/motion/:motionId', isAuthenticated, getMotion);

app.post('/voting/begin', isAuthenticated, beginVotingProcedure);
app.post('/voting/end', isAuthenticated, endVotingProcedure);
app.patch('/voting/vote', isAuthenticated, setVoteState);

export default app;
