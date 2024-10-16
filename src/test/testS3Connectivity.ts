// src/test/testS3Connectivity.ts
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const testS3Connectivity = async () => {
  try {
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    
    console.log("Successfully connected to S3. Buckets:", response.Buckets);
  } catch (error) {
    console.error("Error connecting to S3:", error);
  }
};

testS3Connectivity();
