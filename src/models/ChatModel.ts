import mongoose, { Schema, model, Types, Document } from 'mongoose';

export interface IChat extends Document {
  _id: Types.ObjectId; 
  participants: Types.ObjectId[]; // Array of user IDs (only two for one-to-one chat)
  lastMessage?: Types.ObjectId;  // Reference to the last message
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ],
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

export const ChatModel = model<IChat>('Chat', chatSchema);
