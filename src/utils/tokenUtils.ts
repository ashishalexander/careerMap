
import jwt from 'jsonwebtoken';
import {IAuthTokenPayload} from '../interfaces/authTokenPayload'
export const generateAccessToken = (user: IAuthTokenPayload): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error('JWT_SECRET is not defined');
  
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn: '1d' } 
  );
};

export const generateRefreshToken = (user: IAuthTokenPayload): string => {
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!jwtRefreshSecret) throw new Error('JWT_REFRESH_SECRET is not defined');
  
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    jwtRefreshSecret,
    { expiresIn: '7d' } 
  );
};
