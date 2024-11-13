import {  DeleteObjectCommand } from '@aws-sdk/client-s3';
import s3Client from '../config/s3config';
import { CustomError } from '../errors/customErrors';
import { Is3Service } from './interfaces/Is3Service';
import { IUserRepository } from '../repositories/interfaces/userRepository';
import { HttpStatusCodes } from '../config/HttpStatusCodes'; // Adjust the path as necessary

export class s3Service implements Is3Service {
  constructor(private userRepository: IUserRepository) {}

  /**
   * Uploads a profile picture to S3 and updates the user's profile picture URL in the database.
   *
   * @param file - The uploaded file from the user.
   * @param userId - The ID of the user.
   * @returns The URL of the uploaded profile picture.
   */
  async uploadProfilePicture(file: any, userId: string): Promise<string> {
    const imageUrl = file.location; 

    await this.userRepository.updateProfilePicture(userId, imageUrl);

    return imageUrl;
  }

  /**
   * Removes a profile picture from S3 and updates the user's profile in the database.
   *
   * @param userId - The ID of the user whose profile picture is to be removed.
   * @throws Error if the user or profile picture is not found.
   */
  async removeProfilePicture(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.profile.profilePicture) {
      throw new CustomError('User or profile picture not found.', HttpStatusCodes.NOT_FOUND);
    }

    const key = user.profile.profilePicture.split('.com/')[1];

    const deleteParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
    };

    const command = new DeleteObjectCommand(deleteParams);
    try {
      await s3Client.send(command);
    } catch (error) {
      throw new CustomError('Failed to delete profile picture from S3.', HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
    await this.userRepository.removeProfilePicture(userId);
  }

  /**
   * Upload banner image to S3 and save the URL to the database
   */
  async uploadBannerImage(file: any, userId: string): Promise<string> {

    const bannerUrl = file.location; 
    const user = await this.userRepository.findById(userId); 
    if (!user) {
      throw new CustomError("User not found", HttpStatusCodes.NOT_FOUND);
    }
    user.bannerUrl = bannerUrl;
    await this.userRepository.save(user); 

    return bannerUrl; 
  }
}
