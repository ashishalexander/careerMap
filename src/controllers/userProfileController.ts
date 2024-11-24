import { Request, Response, NextFunction } from "express";
import { IUserProfileService } from "../services/interfaces/IuserProfileService";
import { CustomError } from "../errors/customErrors";
import { HttpStatusCodes } from '../config/HttpStatusCodes';
import { IUser } from "../models/userModel";

export class UserProfileController {
  constructor(private userProfileService: IUserProfileService) {}

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const userId = req.params.userId; 
    const updateData = req.body;  
    console.log(updateData)
    if (!userId || !updateData) {
      return next(new CustomError("User ID and update data are required", HttpStatusCodes.BAD_REQUEST));
    }
    try {
      const updatedUser = await this.userProfileService.updateUserProfile(userId, updateData);

      if (!updatedUser) {
        return next(new CustomError("User not found", HttpStatusCodes.NOT_FOUND));
      }

      return res.status(HttpStatusCodes.OK).json({ message: "Profile updated successfully", data: updatedUser });
    } catch (error) {
      return next(new CustomError("Error updating profile", HttpStatusCodes.INTERNAL_SERVER_ERROR));
    }
  }


  async updateAbout(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const userId = req.params.userId;
    const { about } = req.body; // Expecting about to be a string
  
    if (!userId || typeof about !== 'string') {
      return next(new CustomError("User ID and 'about' data are required", HttpStatusCodes.BAD_REQUEST));
    }
  
    try {
      const updatedUser = await this.userProfileService.updateUserAbout(userId, about);
  
      if (!updatedUser) {
        return next(new CustomError("User not found", HttpStatusCodes.NOT_FOUND));
      }
  
      return res.status(HttpStatusCodes.OK).json({ message: "About section updated successfully", data: updatedUser });
    } catch (error) {
      return next(new CustomError("Error updating about section", HttpStatusCodes.INTERNAL_SERVER_ERROR));
    }
  }

  async updateEducation(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const userId = req.params.userId;
    const { Education } = req.body; 
    console.log(userId, Education)
  
    if (!userId || !Education) {
      return next(new CustomError("User ID and valid education data are required", HttpStatusCodes.BAD_REQUEST));
    }
  
    try {
      const updatedUser = await this.userProfileService.updateUserEducation(userId, Education);
  
      if (!updatedUser) {
        return next(new CustomError("User not found", HttpStatusCodes.NOT_FOUND));
      }
  
      return res
        .status(HttpStatusCodes.OK)
        .json({ message: "Education updated successfully", data: updatedUser });
    } catch (error) {
      return next(
        new CustomError(
          "Error updating education",
          HttpStatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    }
  }

  async deleteEducation(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const userId = req.params.userId;
    const educationId = req.params.index;
    if (!userId || !educationId) {
      return next(new CustomError("User ID and Education ID are required", HttpStatusCodes.BAD_REQUEST));
    }
  
    try {
      const updatedUser = await this.userProfileService.deleteUserEducation(userId, educationId);
  
      return res
        .status(HttpStatusCodes.OK)
        .json({ message: "Education deleted successfully", data: updatedUser });
    } catch (error) {
      return next(
        new CustomError(
          "Error deleting education",
          HttpStatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    }
  }


  async updateExperience(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const { userId, experienceId } = req.params;
    const experienceData = req.body;
  
    if (!userId || !experienceId || !experienceData) {
      return next(new CustomError("User ID, editing index, and experience data are required", HttpStatusCodes.BAD_REQUEST));
    }
  
    try {
      const updatedUser = await this.userProfileService.updateUserExperience(userId, experienceId, experienceData);
  
      if (!updatedUser) {
        return next(new CustomError("User not found", HttpStatusCodes.NOT_FOUND));
      }
  
      return res.status(HttpStatusCodes.OK).json({
        message: "Experience updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      return next(new CustomError("Error updating experience", HttpStatusCodes.INTERNAL_SERVER_ERROR));
    }
  }

  async addExperience(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const userId = req.params.userId;
    const experienceData = req.body;
    console.log(experienceData)
  
    if (!userId || !experienceData) {
      return next(new CustomError("User ID and experience data are required", HttpStatusCodes.BAD_REQUEST));
    }
  
    try {
      const updatedUser = await this.userProfileService.addUserExperience(userId, experienceData);
  
      return res.status(HttpStatusCodes.CREATED).json({
        message: "Experience added successfully",
        data: updatedUser,
      });
    } catch (error) {
      return next(new CustomError("Error adding experience", HttpStatusCodes.INTERNAL_SERVER_ERROR));
    }
  }

  async deleteExperience(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const { userId, experienceId } = req.params;
  
    if (!userId || !experienceId) {
      return next(new CustomError("User ID and experience ID are required", HttpStatusCodes.BAD_REQUEST));
    }
  
    try {
      const updatedUser = await this.userProfileService.deleteUserExperience(userId, experienceId);
  
      return res.status(HttpStatusCodes.OK).json({
        message: "Experience deleted successfully",
        data: updatedUser,
      });
    } catch (error) {
      return next(new CustomError("Error deleting experience", HttpStatusCodes.INTERNAL_SERVER_ERROR));
    }
  }
}
