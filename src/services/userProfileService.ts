import { IUser, IUserCreate } from '../models/userModel'; // Assuming IUserUpdate exists for partial user updates
import { IUserProfileRepository } from '../repositories/interfaces/IuserProfileRepository'; // The repository where user profile data is stored
import { CustomError } from "../errors/customErrors";
import { IUserProfileService } from './interfaces/IuserProfileService'; // Define this interface similar to IUserService
import { HttpStatusCodes } from '../config/HttpStatusCodes'; 

export class UserProfileService implements IUserProfileService {
    constructor(private userProfileRepository: IUserProfileRepository) {}

    /**
   * Updates a user's profile information.
   * 
   * @param userId - The user ID whose profile is to be updated.
   * @param updateData - The partial data to update in the profile.
   * @returns A Promise that resolves to the updated user profile.
   * @throws Error if there is an issue during the update process.
   */
  async updateUserProfile(userId: string, updateData: Partial<IUser>): Promise<IUser> {
    try {
      const updatedUser = await this.userProfileRepository.updateUserProfile(userId, updateData);
      return updatedUser;
    } catch (error) {
      console.error('Error in UserProfileService while updating user profile:', error);
      throw new CustomError('User profile update failed', HttpStatusCodes.INTERNAL_SERVER_ERROR); 
    }
  }

}  