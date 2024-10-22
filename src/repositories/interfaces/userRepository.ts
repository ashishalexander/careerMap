import { IUser } from '../../models/userModel';
import { Types } from 'mongoose';

export interface IUserRepository {
  findUserByEmail(email: string): Promise<IUser | null>;
  createUser(userData: Partial<IUser>): Promise<IUser>;
  findById(userId: string): Promise<IUser |null>;
  updateUserPassword(userId: Types.ObjectId,newPassword:string) :Promise<void>;
  updateProfilePicture(userId: string, profilePictureUrl:string) :Promise<void>;
  removeProfilePicture(userId:string) :Promise<void>
}