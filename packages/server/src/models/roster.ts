import mongoose from 'mongoose';
import { IUser } from './user';

export interface IRoster extends mongoose.Document {
  name: string;
  owner: IUser;
  members: IUser[];
  quorum: number;
}

export const RosterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'User' }],
  quorum: { type: Number, required: true }
});

const Roster = mongoose.model<IRoster>('Roster', RosterSchema);

export default Roster;
