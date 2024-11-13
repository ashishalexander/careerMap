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
    Education: [{
      school: { type: String },
      degree: { type: String },
      startDate: { type: Date },
      endDate: { type: Date },
      skills: [String]
    }],
    Experience: [{
      title: { type: String },
      employmentType: { type: String },
      company: { type: String },
      startDate: { type: Date },
      endDate: { type: Date },
      location: { type: String },
      description: { type: String }
    }],
    Projects: [{
      title: { type: String },
      description: { type: String },
      startDate: { type: Date },
      endDate: { type: Date },
      url: { type: String },
      skills: [String]
    }]
  }
});


// Create the User model
const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

async function updateUsers() {
  try {
    // Update users to move top-level profilePicture to nested profile structure
    const result = await User.updateMany(
      { $or: [{ profile: { $exists: false } }, { 'profile.profilePicture': { $exists: false } }] },
      {
        $set: {
          'profile.profilePicture': '', // Default empty if missing
          'profile.bannerImage': '',
          'profile.about': '',
          'profile.headline': '',
          'profile.location': '',
          'profile.company': '',
          'profile.website': '',
          'profile.connections': 0,
          'profile.Education': [],
          'profile.Experience': [],
          'profile.Projects': [],
          isblocked: false,
        },
        $rename: { 'profilePicture': 'profile.profilePicture' } // Move top-level profilePicture if it exists
      }
    );

    console.log(`${result.modifiedCount} user(s) updated with the new profile structure.`);
  } catch (error) {
    console.error('Error updating users:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Execute the update function
updateUsers();