import { Schema, model, Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;  
  firstName: string;
  lastName: string;
  email: string;
  role: string;         
  mobile: string;
  password: string;
}

export interface IUserCreate {
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
  role: { type: String, required: true },  
  mobile: { type: String, required: true },
  password: { type: String, required: true },
});

export const UserModel = model<IUser>('User', userSchema);
