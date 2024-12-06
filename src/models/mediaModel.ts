import mongoose, { Schema, model, Types, Document } from 'mongoose';

export enum MediaType {
  IMAGE = 'image',
}

export interface IPost extends Document {
  author: Types.ObjectId
  
  text?: string;
  media?: {
    type: MediaType.IMAGE;
    url: string;
    description:string
  };

  likes: {
    userId: Types.ObjectId;
    createdAt: Date;
  }[];
  
  comments: {
    user: Types.ObjectId;
    content: string;
    createdAt: Date;
  }[];

  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>({
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
      enum: Object.values(MediaType),
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
    createdAt: { type: Date, default: Date.now }
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
    createdAt: { type: Date, default: Date.now },
  }],

}, {
  timestamps: true
});

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ 'likes.userId': 1 });


export const PostModel = model<IPost>('Post', postSchema);