import { Request, Response, NextFunction } from "express";
import { IUserProfileService } from "../services/interfaces/IuserProfileService";
import { CustomError } from "../errors/customErrors";
import { HttpStatusCodes } from '../config/HttpStatusCodes';

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
}
