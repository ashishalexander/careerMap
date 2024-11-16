// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { CustomError } from '../errors/customErrors';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET as string; 

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization']; // Get the Authorization header
  const token = authHeader && authHeader.split(' ')[1]; // Extract the token

  if (!token) {
    return next(new CustomError('Access denied. No token provided.', 401));
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as jwt.JwtPayload;
    next(); 
  } catch (error) {
    return next(new CustomError('Invalid token.', 403));
  }
};
