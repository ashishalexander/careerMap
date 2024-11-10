import { Schema, model, Types, Document } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;  
  firstName: string;
  lastName: string;
  email: string;
  role: string;         
  mobile: string;
  password: string;
  profilePicture:string;
  isblocked:boolean;


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
  isblocked:{type:Boolean,default:false},

});

export const UserModel = model<IUser>('User', userSchema);
