/**
 * Provides tools to deal with common user authentication tasks that occur outside of the user controller.
 */
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import authConfig from '../config/auth';
import User, { IUser } from '../models/user';

export type UserJWT = {
  id?: string,
  iat: number,
  exp: number
}

export let getUserFromAuthHeader = async (authHeader: string): Promise<IUser> => {
  const jwtString = authHeader.substring(7);
  const userId: string = (jwt.verify(jwtString, authConfig.secretToken) as UserJWT).id as string;
  
  let user: IUser;
  try {
    user = await User.findById(userId, { password: 0 }).exec();
  } catch (err) {
    throw new Error('User ID in JWT is not valid');
  }

  return user;
}

/**
 * Middleware to check if a user is authenticated before they access a resource.
 * Does not check authorization.
 */
export let isAuthenticated = async (req: Request, res: Response, next: () => void ): Promise<void> => {
  const authHeader: string = req.headers.authorization as string;
  if (!authHeader) {
    res.status(403).send('You must be authenticated to access this resource.');
    return;
  }

  let user: IUser;
  try {
    user = await getUserFromAuthHeader(authHeader);
  } catch (err) {
    res.status(500).send('Error verifying token.');
    return;
  }

  req.user = user;
  next();
}