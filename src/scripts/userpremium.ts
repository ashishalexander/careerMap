import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from '../models/userModel';

// Connect to MongoDB - replace with your actual connection string
mongoose.connect('mongodb://localhost:27017/careerMap');

// Define the user schema
const userSchema: Schema<IUser> = new Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  role: { type: String, default: 'user' },
  mobile: { type: String },
  password: { type: String },
  isblocked: { type: Boolean, default: false },
  profile: {
    profilePicture: { type: String },
    bannerImage: { type: String },
    about: { type: String },
    headline: { type: String },
    location: { type: String },
    company: { type: String },
    website: { type: String },
    connections: { type: Number, default: 0 },
    Education: [
      {
        school: { type: String },
        degree: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        skills: [String],
      },
    ],
    Experience: [
      {
        title: { type: String },
        employmentType: { type: String },
        company: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        location: { type: String },
        description: { type: String },
      },
    ],
    Projects: [
      {
        title: { type: String },
        description: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        url: { type: String },
        skills: [String],
      },
    ],
  },
  subscription: {
    planType: { type: String, enum: ['professional', 'recruiter-pro'], default: null },
    billingCycle: { type: String, enum: ['monthly', 'yearly'], default: null },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    isActive: { type: Boolean, default: false },
    paymentHistory: [
      {
        transactionId: { type: String },
        amount: { type: Number },
        date: { type: Date },
        billingCycle: { type: String, enum: ['monthly', 'yearly'] },
        planType: { type: String, enum: ['professional', 'recruiter-pro'] },
      },
    ],
  },
});

// Create the User model
const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

async function updateUsers() {
  try {
    // Add subscription field to all users without it
    const result = await User.updateMany(
      {
        $or: [
          { subscription: { $exists: false } }, // Users without the subscription field
        ],
      },
      {
        $set: {
          subscription: {
            planType: null,
            billingCycle: null,
            startDate: null,
            endDate: null,
            isActive: false,
            paymentHistory: [],
          },
        },
      }
    );

    console.log(`${result.modifiedCount} user(s) updated with the new subscription field.`);
  } catch (error) {
    console.error('Error updating users:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Execute the update function
updateUsers();
