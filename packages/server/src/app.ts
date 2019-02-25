import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import config from './config';

const dbConn = mongoose.connect('mongodb://localhost/the-committee', { useNewUrlParser: true });

const app = express();

app.set('port', process.env.PORT || config.server.port);

app.get('/', (req: Request, res: Response) => {
  res.send(`Up and running as of ${new Date().toISOString()}`);
});

export default app;
