import mongoose, { Schema, Document, Model } from 'mongoose';

// Define the IUser interface
interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  mobile: string;
  password: string;
  profilePicture: string;
  isblocked: boolean;
}

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
  profilePicture: { type: String },
  isblocked: { type: Boolean, default: false }, // Newly added field
});

// Create the User model
const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

async function updateUsers() {
  try {
    // Update all users without 'isblocked' field to set it to false
    const result = await User.updateMany(
      { isblocked: { $exists: false } }, // Find users without 'isblocked' field
      { $set: { isblocked: false } }      // Set 'isblocked' to false
    );
    console.log(`${result.modifiedCount} user(s) updated with the isblocked field.`);
  } catch (error) {
    console.error('Error updating users:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
}

// Execute the update function
updateUsers();

