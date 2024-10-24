import { Request, Response, NextFunction } from "express";
import { s3Service } from "../services/s3Service"; 
import { CustomError } from "../errors/customErrors";
import { Is3Service } from "../services/interfaces/Is3Service";
import { HttpStatusCodes } from "../config/HttpStatusCodes"; // Import your enum

export class s3Controller {
  constructor(private s3Service: Is3Service) {}

  /**
   * Uploads a profile picture for the specified user.
   *
   * @param req - Express request object containing user ID and file.
   * @param res - Express response object used to send responses to the client.
   * @returns JSON response with the uploaded image URL.
   */
  async uploadProfilePicture(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    const userId = req.params.userId;
    const file: any = req.file;
    if (!file) {
      return next(new CustomError("No file uploaded", HttpStatusCodes.BAD_REQUEST));

    }

    try {
      const imageUrl = file.location;
      await this.s3Service.uploadProfilePicture(file, userId);
      return res.status(HttpStatusCodes.OK).json({ imageUrl });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Deletes a profile picture for the specified user.
   *
   * @param req - Express request object containing user ID.
   * @param res - Express response object used to send responses to the client.
   * @returns JSON response indicating success or failure.
   */
  async deleteProfilePicture(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    const userId = req.params.userId;

    try {
      await this.s3Service.removeProfilePicture(userId);
      return res
        .status(HttpStatusCodes.OK)
        .json({ message: "Profile picture removed successfully" });
    } catch (error) {
      return next(error);
    }
  }
}
