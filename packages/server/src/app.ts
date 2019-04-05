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
import { getMotion, makeMotion, withdrawMotion } from './controllers/motion';
import {
  generateDefaultMotionTypes,
  getMotionSet
} from './controllers/motion-set';
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

app.get('/api', (req: Request, res: Response) => {
  res.send(`Up and running as of ${new Date().toISOString()}`);
});

app.post('/api/user/register', register);
app.post('/api/user/login', login);
app.get('/api/user/:userId', isAuthenticated, getUser);
app.get('/api/user/byEmail/:email', isAuthenticated, getUserByEmail);
app.get('/api/user', isAuthenticated, getCurrentUser);

app.post('/api/roster', isAuthenticated, createRoster);
app.delete('/api/roster/:rosterId', isAuthenticated, deleteRoster);
app.put(
  '/api/roster/:rosterId/addMemberByEmail/:memberEmail',
  isAuthenticated,
  addMemberByEmail
);
app.delete(
  '/api/roster/:rosterId/removeMemberByEmail/:memberEmail',
  isAuthenticated,
  removeMemberByEmail
);
app.get('/api/roster/:rosterId', isAuthenticated, getRoster);

app.get('/api/motionType', isAuthenticated, getMotionTypeForUser);

app.post(
  '/api/motionSet/createDefault',
  isAuthenticated,
  generateDefaultMotionTypes
);
app.get('/api/motionSet/:motionSetId', isAuthenticated, getMotionSet);

// General meeting endpoints
app.post('/api/meeting/start', isAuthenticated, startMeeting);
app.get('/api/meeting/:meetingId', isAuthenticated, getMeeting);

// Chair meeting endpoints
app.patch(
  '/api/meeting/:meetingId/chair/adjourn',
  isAuthenticated,
  adjournMeeting
);

// Participant meeting endpoints
app.get('/api/meetingByMember', isAuthenticated, getMeetingsByMember);
app.patch(
  '/api/meeting/:meetingId/participant/join',
  isAuthenticated,
  joinMeeting
);
app.patch(
  '/api/meeting/:meetingId/participant/leave',
  isAuthenticated,
  leaveMeeting
);

app.post('/api/motion', isAuthenticated, makeMotion);
app.get('/api/motion/:motionId', isAuthenticated, getMotion);
app.patch('/api/motion/:motionId/withdraw', isAuthenticated, withdrawMotion);

app.post('/api/voting/begin', isAuthenticated, beginVotingProcedure);
app.post('/api/voting/end', isAuthenticated, endVotingProcedure);
app.patch('/api/voting/vote', isAuthenticated, setVoteState);

export default app;
