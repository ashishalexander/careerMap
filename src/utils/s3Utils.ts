// utils/s3Utils.ts
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import s3Client from '../config/s3config';

export const deleteImageFromS3 = async (imageUrl: string) => {
  try {
    const regex = /https:\/\/[^/]+\/[^/]+\/(.*)/;

    const match = imageUrl.match(regex);

    if (match && match[1]) {
      const fileKey = match[1]; // Extract file key

      const deleteParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME || 'careermap-bucket',
        Key: fileKey,
      };

      await s3Client.send(new DeleteObjectCommand(deleteParams));
      console.log(`Deleted image from S3: ${fileKey}`);
    } else {
      throw new Error('Invalid S3 URL');
    }
  } catch (error) {
    console.error('Error deleting image from S3:', error);
    throw new Error('Error deleting image from S3');
  }
};
