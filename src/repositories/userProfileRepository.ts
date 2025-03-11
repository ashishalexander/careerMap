import { IUser, UserModel } from '../models/userModel';
import { CustomError } from '../errors/customErrors';
import { HttpStatusCodes } from '../config/HttpStatusCodes';
import { IUserProfileRepository } from './interfaces/IUserProfileRepository'; // Import the interface
import { Types } from 'mongoose';
import _ from 'lodash';
import { IExperience, IExperienceInput } from '../services/interfaces/IuserProfileService';
import { IPost, PostModel } from '../models/mediaModel';
import { JobModel } from '../models/JobsModel';

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

  async updateUserAbout(userId: string, about: string): Promise<IUser> {
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { $set: { 'profile.about':about } },
        { new: true, runValidators: true }
      ).exec();
  
      if (!updatedUser) {
        throw new CustomError('User not found', HttpStatusCodes.NOT_FOUND);
      }
  
      return updatedUser;
    } catch (error) {
      console.error('Error updating user about section:', error);
      throw new CustomError('Failed to update about section', HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

    async updateUserEducation(userId: string, Education: Partial<IUser>): Promise<IUser> {
      try {
        console.log(Education)
        const updatedUser = await UserModel.findByIdAndUpdate(
          userId,
          { $push: { 'profile.Education': Education } }, // Assuming education is nested in the profile object
          { new: true, runValidators: true } // Ensures the updated document is returned and validations run
        ).exec();
    
        if (!updatedUser) {
          throw new CustomError("User not found", HttpStatusCodes.NOT_FOUND);
        }
    
        return updatedUser;
      } catch (error) {
        console.error("Error updating education:", error);
        throw new CustomError("Failed to update education", HttpStatusCodes.INTERNAL_SERVER_ERROR);
      }
    }

    async editUserEducation(userId: string, Education: Partial<IUser>, EducationId: string): Promise<IUser | null> {
      try {
        const updatedUser = await UserModel.findOneAndUpdate(
          {
            _id: userId,
            'profile.Education._id': EducationId, // Ensure the education ID exists
          },
          {
            $set: {
              'profile.Education.$': {
                ...Education,
                _id: EducationId, // Ensure the ID remains intact
              },
            },
          },
          { new: true } // Return the updated user document
        );
    
        return updatedUser;
      } catch (error) {
        console.error('Error in userProfileRepository while editing education:', error);
        throw error;
      }
    }
    async deleteUserEducation(userId: string, educationId: string): Promise<IUser> {
      try {
        const updatedUser = await UserModel.findByIdAndUpdate(
          userId,
          { $pull: { 'profile.Education': { _id: new Types.ObjectId(educationId) } } },
          { new: true, runValidators: true }
        ).exec();
    
        if (!updatedUser) {
          throw new CustomError("User not found", HttpStatusCodes.NOT_FOUND);
        }
    
        return updatedUser;
      } catch (error) {
        console.error("Error deleting education:", error);
        throw new CustomError("Failed to delete education", HttpStatusCodes.INTERNAL_SERVER_ERROR);
      }
    }


    async updateUserExperience(
      userId: string,
      editingIndex: string,
      experienceData: IExperience
    ): Promise<IUser> {
      try {
        const user = await UserModel.findById(userId).exec();
    
        if (!user || !user.profile || !Array.isArray(user.profile.Experience)) {
          throw new CustomError("User or experience not found", HttpStatusCodes.NOT_FOUND);
        }
    
        // Find the experience object by its _id
        const experience = user.profile.Experience.find(
          (exp) => exp._id.toString() === editingIndex
        );
    
        if (!experience) {
          throw new CustomError("Experience not found", HttpStatusCodes.NOT_FOUND);
        }
    
        Object.assign(experience, experienceData);
    
        const updatedUser = await user.save();
    
        return updatedUser;
      } catch (error) {
        console.error("Error updating user experience:", error);
        throw new CustomError("Failed to update experience", HttpStatusCodes.INTERNAL_SERVER_ERROR);
      }
    }
    async addUserExperience(userId: string, experienceData: IExperience): Promise<IUser> {
      try {
        const updatedUser = await UserModel.findByIdAndUpdate(
          userId,
          { $push: { 'profile.Experience': experienceData } },
          { new: true, runValidators: true }
        ).exec();
    
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
        const updatedUser = await UserModel.findByIdAndUpdate(
          userId,
          { $pull: { 'profile.Experience': { _id: new Types.ObjectId(experienceId) } } },
          { new: true, runValidators: true }
        ).exec();
    
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
        const activity = await  PostModel.find({author:userId})
        if(!activity){
          throw new CustomError('User not found',HttpStatusCodes.NOT_FOUND)
        }
        return activity
      } catch (error) {
        console.error("Error in finding user activity",error)
        throw new CustomError("Failed to fetch user activity",HttpStatusCodes.INTERNAL_SERVER_ERROR)
      }
    }

    async recruiterJobPosts(userId:string):Promise<any>{
      try {
        const JobPosts = await JobModel.find({recruiter:userId})
        if(!JobPosts){
          throw new CustomError('user not found',HttpStatusCodes.NOT_FOUND)
        }
        return JobPosts
      } catch (error) {
        console.error("Error in finding recruiter Job posts",error)
        throw new CustomError("Failed to fetch recruiter activity",HttpStatusCodes.INTERNAL_SERVER_ERROR)
      }
    }

    async getUserProfile(userId: string): Promise<IUser> {
      try {
        const user = await UserModel.findById(userId)
          .select('-password -refreshToken') // Exclude sensitive fields
          .populate('profile.Education')
          .populate('profile.Experience')
          .lean();
  
        if (!user) {
          throw new CustomError('User not found', HttpStatusCodes.NOT_FOUND);
        }
  
        return user;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        throw new CustomError('Failed to fetch user profile', HttpStatusCodes.INTERNAL_SERVER_ERROR);
      }
    }

    async deletePost(postId: string):Promise<IPost|null> {
      try {
        const deletedPost = await PostModel.findByIdAndDelete(postId);
        return deletedPost;
      } catch (error) {
        console.error("Database error while deleting post:", error);
        throw new CustomError("Database error: Unable to delete post",HttpStatusCodes.INTERNAL_SERVER_ERROR); 
      }  
    }
  
}