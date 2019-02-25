import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import config from '../config';

export interface IUserModel extends mongoose.Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;

  comparePassword: comparePasswordFunction;
}

export type comparePasswordFunction = (
  candidatePassword: string,
) => Promise<boolean>;

export const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true }
});

UserSchema.pre<IUserModel>('save', function save(next) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt
    .hash(user.password, config.passwordHashing.saltRounds)
    .catch((err: any) => {
      return next(err);
    })
    .then((hash: string) => {
      user.password = hash;
      next();
    });
});

const comparePassword: comparePasswordFunction = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.comparePassword = comparePassword;

const User = mongoose.model<IUserModel>('User', UserSchema);

export default User;
