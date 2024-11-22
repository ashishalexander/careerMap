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
}
