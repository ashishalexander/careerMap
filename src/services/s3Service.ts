import {  DeleteObjectCommand } from '@aws-sdk/client-s3';
import s3Client from '../config/s3config';
import { UserRepository } from '../repositories/userRepository';
import { CustomError } from '../errors/customErrors';

export class s3Service {
  constructor(private userRepository: UserRepository) {}

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
    if (!user || !user.profilePicture) {
      throw new CustomError('User or profile picture not found.', 404);
    }

    const key = user.profilePicture.split('.com/')[1];

    const deleteParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
    };

    const command = new DeleteObjectCommand(deleteParams);
    await s3Client.send(command);

    await this.userRepository.removeProfilePicture(userId);
  }
}
