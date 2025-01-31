import mongoose from 'mongoose';
import { UserModel } from '../models/userModel';  // Adjust path as needed
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/careerMap';

// Helper function to get random date from last 3 months
const getRandomDate = () => {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 3);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

async function updateUserDates() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Use updateMany instead of find and save
    const result = await UserModel.updateMany(
      {}, // match all documents
      [
        {
          $set: {
            createdAt: getRandomDate(),
            updatedAt: new Date() // Also set updatedAt
          }
        }
      ]
    );

    console.log(`Successfully updated ${result.modifiedCount} users with random dates`);

  } catch (error) {
    console.error('Error updating user dates:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the update function
updateUserDates();