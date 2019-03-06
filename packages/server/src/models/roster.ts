import mongoose from 'mongoose';
import { IUserModel } from './user';

export interface IRosterModel extends mongoose.Document {
  name: string;
  owner: IUserModel;
  members: IUserModel[];
  quorum: number;
}

export const RosterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'User' }],
  quorum: { type: Number, required: true }
});

const Roster = mongoose.model<IRosterModel>('Roster', RosterSchema);

export default Roster;
