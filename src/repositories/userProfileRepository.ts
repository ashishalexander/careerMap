import { IUser, UserModel } from '../models/userModel';
import { CustomError } from '../errors/customErrors';
import { HttpStatusCodes } from '../config/HttpStatusCodes';
import { IUserProfileRepository } from './interfaces/IuserProfileRepository'; // Import the interface
import { Types } from 'mongoose';
import _ from 'lodash';


export class UserProfileRepository implements IUserProfileRepository {
    /**
   * Updates a user's profile with the given data.
   * 
   * @param userId - The ID of the user whose profile is to be updated.
   * @param updateData - The data to be updated (using Partial<IUser>).
   * @returns A Promise that resolves to the updated user object.
   * @throws Error if there is an issue during the update process.
   */
  async updateUserProfile(userId: string, updateData: Partial<IUser>): Promise<IUser> {
    try {
      const existingUser = await UserModel.findById(userId).exec();
      if (!existingUser) {
        throw new CustomError('User not found', HttpStatusCodes.NOT_FOUND);
      }
      // Use Lodash's merge to update fields without overwriting nested data
      const mergedData = _.merge({}, existingUser.toObject(), updateData);

      // Update the document with the merged data
      existingUser.set(mergedData);

      // Save the updated document to the database
      const updatedUser = await existingUser.save();

      return updatedUser;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new CustomError('Failed to update user profile', HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}