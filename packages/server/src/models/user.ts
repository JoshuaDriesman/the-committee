import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;

  comparePassword: comparePasswordFunction;
}

export type comparePasswordFunction = (
  candidatePassword: string
) => Promise<boolean>;

export const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true }
});

UserSchema.pre<IUser>('save', function save(next) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt
    .hash(user.password, 10)
    .catch((err: any) => {
      return next(err);
    })
    .then((hash: string) => {
      user.password = hash;
      next();
    });
});

const comparePassword: comparePasswordFunction = async function(
  candidatePassword
) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.comparePassword = comparePassword;

const User = mongoose.model<IUser>('User', UserSchema);

export default User;

/**
 * A safe way to get users by ID. Automatically masks the password 
 * as well as checks for errors in DB query and empty results.
 * Returns errors in a controller friendly format.
 * @param userId the ID of the user to retrieve
 */
export const fetchUserById = async (userId: string) => {
  let user;
  try {
    user = await User.findById(userId, { password: 0 });
  } catch (err) {
    throw {
      error: `Error getting user with ID ${userId}`,
      resCode: 500
    };
  }

  if (!user) {
    throw {
      error: `User not found for ${userId}`,
      resCode: 404
    };
  }

  return user;
}