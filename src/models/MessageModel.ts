import mongoose, { model, Schema, Types } from "mongoose";

export interface IMessage extends Document {
    id: string;
    chat: Types.ObjectId;           // Reference to the Chat
    sender: Types.ObjectId;         // User ID of the sender
    content: string;                // Message content
    type: 'text' | 'image' | 'file'; // Type of message
    readBy: Types.ObjectId[];       // Array of user IDs who have read the message
    createdAt: Date;
    updatedAt: Date;
  }
  
  const messageSchema = new Schema<IMessage>(
    {
      chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      content: { type: String, required: true },
      type: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
      readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true } // Automatically adds createdAt and updatedAt
  );
  
  export const MessageModel = model<IMessage>('Message', messageSchema);
  