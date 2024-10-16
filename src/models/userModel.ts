import { Schema, model, Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;  
  firstName: string;
  lastName: string;
  email: string;
  role: string;         
  mobile: string;
  password: string;
  profilePicture:string;


}

export interface IUserCreate {
  firstName: string;
  lastName: string;
  email: string;
  role?: string;        
  mobile?: string;
  password?: string;
  profilePicture?:string;
}

const userSchema = new Schema<IUser>({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  role: { type: String,default:'user' },  
  mobile: { type: String },
  password: { type: String },
  profilePicture: { type: String },

});

export const UserModel = model<IUser>('User', userSchema);
