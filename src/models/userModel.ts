// src/models/user.model.ts
import { Schema, model } from 'mongoose';

export interface IUser  {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  mobile: string;
  password: string;
}

const userSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true },  // user or recruiter
  mobile: { type: String, required: true },
  password: { type: String, required: true },
});

export const UserModel = model<IUser>('User', userSchema);
