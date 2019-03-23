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

/**
 * Fetches a roster with the given ID. Checks for errors and empty results.
 * Returns a map with an error statement and HTTP error code
 * that can be used by a controller to build a response.
 * @param rosterId the ID of the roster you want to fetch
 */
export const fetchRosterById = async (rosterId: string) => {
  let roster: IRoster;
  try {
    roster = await Roster.findById(rosterId)
      .populate('owner', { password: 0 })
      .populate('members', { password: 0 })
      .exec();
  } catch (err) {
    throw {
      error: `Error getting the roster with ID ${rosterId}`,
      resCode: 500
    };
  }

  if (!roster) {
    throw { error: `Could not find roster with ID ${rosterId}`, resCode: 404 };
  }

  return roster;
};
