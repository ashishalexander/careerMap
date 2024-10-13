// src/repositories/user.repository.ts
import { IUserRepository } from './interfaces/user';
import { IUser, UserModel } from '../models/userModel';
import { Types } from 'mongoose';

export class UserRepository implements IUserRepository {

  async findUserByEmail(email: string): Promise<IUser | null> {
    try {
      const user = await UserModel.findOne({ email });
      return user; 
    } catch (error) {
      console.error(`Error finding user by email ${email}:`, error);
      throw new Error('Failed to find user by email');
    }
  }

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    try {
      const newUser = new UserModel(userData);
      return await newUser.save(); 
    } catch (error) {
      console.error('Error creating new user:', error);
      throw new Error('Failed to create new user');
    }
  }

    async updateUserPassword(userId: Types.ObjectId, newPassword: string): Promise<void> {
      try{
        const result = await UserModel.findByIdAndUpdate(
          userId,
          { password: newPassword }, 
          { new: true } 
        ).exec();
        if (!result) {
          throw new Error('User not found');
        }
      }catch(error){
          console.error('Error in updating password:',error)
          throw new Error('Failed to update password')
      }
  }
}
