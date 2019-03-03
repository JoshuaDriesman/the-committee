import mongoose from 'mongoose';

export interface IRosterModel extends mongoose.Document {
  name: string;
  ownerId: string;
  memberIds?: string[];
  quorum: number;
}

export const RosterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerId: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true },
  memberIds: { type: [mongoose.SchemaTypes.ObjectId], ref: 'User' },
  quorum: { type: Number, required: true }
});

const Roster = mongoose.model<IRosterModel>('Roster', RosterSchema);

export default Roster;
