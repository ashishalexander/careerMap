import mongoose, { Schema, Document } from "mongoose";

export interface IUserNotification extends Document {
  type: "like" | "comment" | "follow" | "message" | "general"; 
  senderId: string;
  receiverId: string; 
  postId: string; 
  comment?: string; 
  message?: string;
  createdAt: Date; 
}

const UserNotificationSchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: ["like", "comment", "follow", "message", "general"],
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
    comment: {
      type: String,
    },
    message: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

export const UserNotification = mongoose.model<IUserNotification>(
  "UserNotification",
  UserNotificationSchema
);
