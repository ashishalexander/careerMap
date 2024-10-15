// src/controllers/profileController.ts
import { Request, Response } from 'express';
import { s3Service } from '../services/s3Service'; // Assuming you have a S3Service for handling S3 operations

export class s3Controller {
  constructor(private s3Service: s3Service) {}

  /**
   * Uploads a profile picture for the specified user.
   *
   * @param req - Express request object containing user ID and file.
   * @param res - Express response object used to send responses to the client.
   * @returns JSON response with the uploaded image URL.
   */
  async uploadProfilePicture(req: Request, res: Response): Promise<Response> {
    const userId = req.params.userId;
    const file: any = req.file; 
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      const imageUrl = file.location; 
      await this.s3Service.uploadProfilePicture(file, userId);
      return res.status(200).json({ imageUrl });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Deletes a profile picture for the specified user.
   *
   * @param req - Express request object containing user ID.
   * @param res - Express response object used to send responses to the client.
   * @returns JSON response indicating success or failure.
   */
  async deleteProfilePicture(req: Request, res: Response): Promise<Response> {
    const userId = req.params.userId;

    try {
      await this.s3Service.removeProfilePicture(userId);
      return res.status(200).json({ message: 'Profile picture removed successfully' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
