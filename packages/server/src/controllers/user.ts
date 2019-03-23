import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import authConfig from '../config/auth';
import User, { IUser, fetchUserById } from '../models/user';

const generateToken = (user: IUser): string => {
  return jwt.sign({ id: user.id }, authConfig.secretToken, {
    expiresIn: authConfig.tokenExpirationTime
  });
};

export const register = async (req: Request, res: Response) => {
  req.assert('email', 'Email is required').notEmpty();
  req.assert('password', 'Password is required').notEmpty();
  req.assert('firstName', 'First name is required').notEmpty();
  req.assert('lastName', 'Last name is required').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }

  try {
    const maybeUser = await User.findOne({ email: req.body.email }).exec();
    if (maybeUser) {
      return res.status(400).send('User with that email already exists');
    }
  } catch (err) {
    return res.status(500).send('User could not be created');
  }

  const newUser = new User({
    email: req.body.email,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName
  });

  try {
    const savedUser = await newUser.save();
    return res.send(`User with email ${savedUser.email} created successfully.`);
  } catch (err) {
    return res.status(500).send('User could not be created');
  }
};

export const login = async (req: Request, res: Response) => {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }

  let user: IUser;
  try {
    user = await User.findOne({ email: req.body.email }).exec();
  } catch (err) {
    return res.status(500).send('User lookup failed');
  }

  if (!user) {
    return res
      .status(404)
      .send(`User with the email ${req.body.email} not found.`);
  }

  let isPasswordValid: boolean;
  try {
    isPasswordValid = await user.comparePassword(req.body.password);
  } catch (err) {
    return res.status(500).send('Error verifying password.');
  }

  if (isPasswordValid) {
    return res.send(generateToken(user));
  }

  res.status(403).send('Incorrect password!');
};

export const getUser = async (req: Request, res: Response) => {
  const userId = req.params.userId;

  let user;
  try {
    user = await fetchUserById(userId);
  } catch (err) {
    return res.status(err.resCode).send(err.error);
  }

  return res.send(user);
};

export const getUserByEmail = async (req: Request, res: Response) => {
  const email = req.params.email;

  let user;
  try {
    user = await User.findOne({ email }, { password: 0 });
  } catch (err) {
    return res.status(500).send(`Could not get user with email ${email}`);
  }

  if (!user) {
    return res.status(404).send(`User not found for ${email}`);
  }

  return res.send(user);
};
