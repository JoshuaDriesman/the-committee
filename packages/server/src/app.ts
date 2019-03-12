import bodyParser from 'body-parser';
import compression from 'compression';
import express, { Request, Response } from 'express';
import expressValidator from 'express-validator';
import mongoose from 'mongoose';

import serverConfig from './config/server';
import { isAuthenticated } from './utils/user-auth';

import {
  addMemberByEmail,
  createRoster,
  getRoster,
  removeMemberByEmail
} from './controllers/roster';
import { getUser, getUserByEmail, login, register } from './controllers/user';

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

export default app;
