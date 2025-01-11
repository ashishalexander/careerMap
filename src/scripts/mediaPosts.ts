import mongoose, { Schema, model, Types, Document } from 'mongoose';

// Define the schema directly in the script
const postSchema = new Schema(
  {
    author: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    text: { 
      type: String, 
      trim: true 
    },
    media: [{
      type: { 
        type: String, 
        enum: ['image'], 
        required: true 
      },
      url: { 
        type: String, 
        required: true 
      },
      description: { 
        type: String, 
        trim: true 
      }
    }],
    likes: [{
      userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
      },
      createdAt: { 
        type: Date, 
        default: Date.now 
      }
    }],
    comments: [{
      user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
      },
      content: { 
        type: String, 
        required: true, 
        trim: true 
      },
      isDeleted: { 
        type: Boolean, 
        default: false 
      },
      createdAt: { 
        type: Date, 
        default: Date.now 
      }
    }],
    isDeleted: { 
      type: Boolean, 
      default: false 
    }
  },
  { timestamps: true }
);

// Create the model from the schema
const PostModel = model('Post', postSchema);

// Connect to MongoDB
mongoose
  .connect('mongodb://localhost:27017/careerMap')
  .then(async () => {
    console.log('Connected to MongoDB');
    await updatePosts();
    mongoose.connection.close();
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

async function updatePosts() {
  try {
    // Update posts where 'isDeleted' doesn't exist
    const result = await PostModel.updateMany(
      { isDeleted: { $exists: false } },  // Match posts where isDeleted doesn't exist
      { $set: { isDeleted: false } }      // Set isDeleted to false
    );

    console.log(`${result.matchedCount} post(s) matched the query.`);
    console.log(`${result.modifiedCount} post(s) updated with the isDeleted field.`);
  } catch (error) {
    console.error('Error updating posts:', error);
  }
}
