import { IUser } from '../models/userModel'; 
import { IUserProfileRepository } from '../repositories/interfaces/IUserProfileRepository';
import { CustomError } from "../errors/customErrors";
import { IExperience, IUserProfileService } from './interfaces/IuserProfileService'; 
import { HttpStatusCodes } from '../config/HttpStatusCodes'; 
import { IPost } from '../models/mediaModel';
import { deleteImageFromS3 } from '../utils/s3Utils';

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
 /**
   * Updates only the 'about' section of the user's profile.
   * 
   * @param userId - The user ID whose 'about' section is to be updated.
   * @param about - The new 'about' information.
   * @returns A Promise that resolves to the updated user profile.
   * @throws CustomError if there is an issue during the update process.
   */
 async updateUserAbout(userId: string, about: string): Promise<IUser> {
    try {
      const updatedUser = await this.userProfileRepository.updateUserAbout(userId, about);

      if (!updatedUser) {
        throw new CustomError('User not found', HttpStatusCodes.NOT_FOUND);
      }

      return updatedUser;
    } catch (error) {
      console.error('Error in UserProfileService while updating user about section:', error);
      throw new CustomError('Failed to update about section', HttpStatusCodes.INTERNAL_SERVER_ERROR); 
    }
  }

  async updateUserEducation(userId: string, Education: Partial<IUser>): Promise<IUser> {
    try {
      const updatedUser = await this.userProfileRepository.updateUserEducation(userId, Education);
  
      if (!updatedUser) {
        throw new CustomError("User not found", HttpStatusCodes.NOT_FOUND);
      }
  
      return updatedUser;
    } catch (error) {
      console.error("Error in UserProfileService while updating education:", error);
      throw new CustomError("Failed to update education", HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async editUserEducation(userId: string, Education:Partial<IUser>,EducationId:string):Promise<IUser> {
    try {
      const editedUser = await this.userProfileRepository.editUserEducation(userId,Education,EducationId)

      if(!editedUser){
        throw new CustomError("user not found",HttpStatusCodes.NOT_FOUND)
      }
      return editedUser
    } catch (error) {
      console.error("Error in userprofileservice while editing education",error)
      throw (new CustomError("Failed to edit education", HttpStatusCodes.INTERNAL_SERVER_ERROR))
    }
      
  }


  async deleteUserEducation(userId: string, educationId: string): Promise<IUser> {
    try {
      const updatedUser = await this.userProfileRepository.deleteUserEducation(userId, educationId);
  
      if (!updatedUser) {
        throw new CustomError("User not found", HttpStatusCodes.NOT_FOUND);
      }
  
      return updatedUser;
    } catch (error) {
      console.error("Error in UserProfileService while deleting education:", error);
      throw new CustomError("Failed to delete education", HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  }


  async updateUserExperience(userId: string, editingIndex: string, experienceData:IExperience): Promise<IUser> {
    try {
      const updatedUser = await this.userProfileRepository.updateUserExperience(userId, editingIndex, experienceData);
  
      if (!updatedUser) {
        throw new CustomError("User not found", HttpStatusCodes.NOT_FOUND);
      }
  
      return updatedUser;
    } catch (error) {
      console.error("Error updating user experience:", error);
      throw new CustomError("Failed to update experience", HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async addUserExperience(userId: string, experienceData: IExperience): Promise<IUser> {
    try {
      const updatedUser = await this.userProfileRepository.addUserExperience(userId, experienceData);
  
      if (!updatedUser) {
        throw new CustomError("User not found", HttpStatusCodes.NOT_FOUND);
      }
  
      return updatedUser;
    } catch (error) {
      console.error("Error adding user experience:", error);
      throw new CustomError("Failed to add experience", HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  }


  async deleteUserExperience(userId: string, experienceId: string): Promise<IUser> {
    try {
      const updatedUser = await this.userProfileRepository.deleteUserExperience(userId, experienceId);
  
      if (!updatedUser) {
        throw new CustomError("User not found", HttpStatusCodes.NOT_FOUND);
      }
  
      return updatedUser;
    } catch (error) {
      console.error("Error deleting user experience:", error);
      throw new CustomError("Failed to delete experience", HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
  
  async fetchActivity(userId:string):Promise<any>{
    try {
      const activity = await this.userProfileRepository.fetchActivity(userId)
      if(!activity){
        throw new CustomError("activity not found",HttpStatusCodes.NOT_FOUND)
      }
      return activity
    } catch (error) {
      throw new CustomError("Failed to fetch activity",HttpStatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  async recruiterJobPosts(userId:string):Promise<any>{
    try {
      const JobPosts = await this.userProfileRepository.recruiterJobPosts(userId)
      if(!JobPosts){
        throw new CustomError("recruiter Job Posts not found",HttpStatusCodes.NOT_FOUND)
      }
      return JobPosts
    } catch (error) {
      throw new CustomError("Failed to fetch recruiter Job posts",HttpStatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  async getUserProfile(userId: string): Promise<IUser> {
    try {
      const user = await this.userProfileRepository.getUserProfile(userId);
      
      if (!user) {
        throw new CustomError('User not found', HttpStatusCodes.NOT_FOUND);
      }

      return user;
    } catch (error) {
      console.error('Error in UserProfileService while fetching user profile:', error);
      throw new CustomError('Failed to fetch user profile', HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async deletePost(postId: string): Promise<IPost | null> {
    try {
      const deletedPost = await this.userProfileRepository.deletePost(postId);
      if (!deletedPost) {
        throw new Error("Post not found");
      }
  
      const mediaUrls = Array.isArray(deletedPost.media)
        ? deletedPost.media.map(media => media.url)
        : [];
  
      for (const imageUrl of mediaUrls) {
        try {
          await deleteImageFromS3(imageUrl); 
        } catch (error) {
          console.error(`Failed to delete image from S3: ${imageUrl}`, error);
        }
      }
  
      return deletedPost;
    } catch (error) {
      console.error("Error in service while deleting post:", error);
      throw new CustomError(
        "Failed to delete post. Please try again.",
        HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
  

}  