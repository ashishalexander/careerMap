// src/repositories/user.repository.ts
import { IUserRepository } from './interfaces/user';
import { IUser, UserModel } from '../models/userModel';
import { Types } from 'mongoose';
import { CustomError } from '../errors/customErrors';

export class UserRepository implements IUserRepository {
  /**
   * Finds a user by their email address.
   * 
   * @param email - The email address of the user to be found.
   * @returns A Promise that resolves to the user object if found, or null if not.
   * @throws Error if there is an issue during the database operation.
   */
  async findUserByEmail(email: string): Promise<IUser | null> {
    try {
      const user = await UserModel.findOne({ email });
      return user; 
    } catch (error) {
      console.error(`Error finding user by email ${email}:`, error);
      throw new CustomError('Failed to find user by email', 500);
    }
  }
  /**
   * Creates a new user in the database.
   * 
   * @param userData - An object containing user data to be saved.
   * @returns A Promise that resolves to the newly created user object.
   * @throws Error if there is an issue during the creation process.
   */
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    try {
      const newUser = new UserModel(userData);
      return await newUser.save(); 
    } catch (error) {
      console.error('Error creating new user:', error);
      throw new CustomError('Failed to create new user', 500);
    }
  }
  /**
   * Finds a user by their ID.
   * 
   * @param userId - The ID of the user to be found.
   * @returns A Promise that resolves to the user object if found, or null if not.
   * @throws Error if there is an issue during the database operation.
   */
  async findById(userId: string): Promise<IUser | null> {
    try {
      const user = await UserModel.findById(userId).exec();
      return user;
    } catch (error) {
      console.error(`Error finding user by ID ${userId}:`, error);
      throw new CustomError('Failed to find user by ID', 500);
    }
  }
  /**
   * Updates the password of an existing user.
   * 
   * @param userId - The ID of the user whose password is to be updated.
   * @param newPassword - The new password to be set for the user.
   * @returns A Promise that resolves when the password is successfully updated.
   * @throws Error if there is an issue during the update process or if the user is not found.
   */
    async updateUserPassword(userId: Types.ObjectId, newPassword: string): Promise<void> {
      try{
        const result = await UserModel.findByIdAndUpdate(
          userId,
          { password: newPassword }, 
          { new: true } 
        ).exec();
        if (!result) {
          throw new CustomError('User not found', 404);
        }
      }catch(error){
          console.error('Error in updating password:',error)
          throw new CustomError('Failed to update password', 500);
        }
  }
  /**
   * Updates the profile picture of an existing user.
   * 
   * @param userId - The ID of the user whose profile picture is to be updated.
   * @param profilePictureUrl - The new profile picture URL to be set for the user.
   * @returns A Promise that resolves when the profile picture is successfully updated.
   * @throws Error if there is an issue during the update process or if the user is not found.
   */
  async updateProfilePicture(userId: string, profilePictureUrl: string): Promise<void> {
    try {
      const result = await UserModel.findByIdAndUpdate(
        userId,
        { profilePicture: profilePictureUrl },  
        { new: true }
      ).exec();
      if (!result) {
        throw new CustomError('User not found', 404);
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
      throw new CustomError('Failed to update profile picture', 500);
    }
  }

  /**
   * Removes the profile picture of an existing user.
   * 
   * @param userId - The ID of the user whose profile picture is to be removed.
   * @returns A Promise that resolves when the profile picture is successfully removed.
   * @throws Error if there is an issue during the update process or if the user is not found.
   */
  async removeProfilePicture(userId: string): Promise<void> {
    try {
      const result = await UserModel.findByIdAndUpdate(
        userId,
        { $unset: { profilePicture: 1 } },  // Unset the profile picture field
        { new: true }
      ).exec();
      if (!result) {
        throw new CustomError('User not found', 404);
      }
    } catch (error) {
      console.error('Error removing profile picture:', error);
      throw new CustomError('Failed to remove profile picture', 500);
    }
  }
}
