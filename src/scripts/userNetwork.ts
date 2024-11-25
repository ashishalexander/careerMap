import mongoose, { Model, Schema } from 'mongoose';
import { IUser } from '../models/userModel';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/careerMap')
  .then(() => {
    console.log('Connected to MongoDB');
    updateUsers();
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

const userSchema = new Schema<IUser>({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  role: { type: String, default: 'user' },
  mobile: { type: String },
  password: { type: String },
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
  },
  isblocked: { type: Boolean, default: false },
  Network: {
    connections: [{
      userId: { type: String },
      connectedAt: { type: Date },
    }],
    pendingRequestsSent: [{
      userId: { type: String },
      sentAt: { type: Date },
    }],
    pendingRequestsReceived: [{
      userId: { type: String },
      sentAt: { type: Date },
    }],
  }
});

// Define the user schema and model
const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

async function updateUsers() {
  try {
    // Update users to ensure network structure exists and new fields are added
    const result = await User.updateMany(
      {
        $or: [
          { 'Network': { $exists: false } },  // Users without the network field
          { 'Network.connections': { $exists: false } },  // Users without connections array
          { 'Network.pendingRequestsSent': { $exists: false } },  // Users without pendingRequestsSent
          { 'Network.pendingRequestsReceived': { $exists: false } }  // Users without pendingRequestsReceived
        ]
      },
      {
        $set: {
          'Network': {
            connections: [],  // Initialize empty connections array
            pendingRequestsSent: [],  // Initialize empty pendingRequestsSent array
            pendingRequestsReceived: []  // Initialize empty pendingRequestsReceived array
          },
        },
      }
    );

    // Log the number of matched and modified documents
    console.log(`${result.matchedCount} user(s) matched the query.`);
    console.log(`${result.modifiedCount} user(s) updated with the new network structure.`);

  } catch (error) {
    console.error('Error updating users:', error);
  } finally {
    mongoose.connection.close();
  }
}
