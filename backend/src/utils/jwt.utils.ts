import { config } from 'dotenv';
config()
import jwt from 'jsonwebtoken';
import { Response } from 'express';

const secret: string = process.env.JWT_SECRET || '';

export const signToken = (payload: any, res: Response) => {
  const token = jwt.sign(payload, secret, { expiresIn: '3d' });

  const sixMonthsInMilliseconds = 180 * 24 * 60 * 60 * 1000;

  res.cookie('token', token, {
    httpOnly: false,
    secure: false,
    signed: false,
    maxAge: sixMonthsInMilliseconds,
    expires: new Date(Date.now() + sixMonthsInMilliseconds),
    sameSite: 'none'
  });
  
  return token;
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, secret);
};
