import { Types } from "mongoose";
export interface IAuthTokenPayload {
    email: string;
    role: string;
    _id: Types.ObjectId; 
    exp?: number;
    
  }