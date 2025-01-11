import { IUserMediaRepository } from "./interfaces/IUserMediaRepository";
import { PostModel } from "../models/mediaModel";
import { IPost } from "../models/mediaModel";
import { CustomError } from "../errors/customErrors";
import { HttpStatusCodes } from "../config/HttpStatusCodes";
import { UserModel } from "../models/userModel";
import mongoose, { Types } from "mongoose";

export class UserMediaRepository implements IUserMediaRepository {
  /**
   * Create a new post in the database
   * @param post - Partial post object containing text, media, etc.
   * @returns The created post document
   */
  async create(post: Partial<IPost>): Promise<IPost> {
    try {
      const createdPost = await PostModel.create(post);
      return createdPost;
    } catch (error: any) {
      console.error("Error in PostRepository:", error.message);
      throw new CustomError(
        "Failed to create post",
        HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getUserConnections(userId: string): Promise<string[]> {
    const user = await UserModel.findById(new mongoose.Types.ObjectId(userId)).select('Network.connections');
    console.log(JSON.stringify(user))
    if (!user || !user.Network || !user.Network.connections) {
      return [];
    }
    return user.Network.connections.map(conn => conn.userId.toString());
  }
  
  async getPostsByConnections(
    connections: string[],
    skip: number,
    limit: number
  ): Promise<any[]> {
    return await PostModel.find({ author: { $in: connections },isDeleted:false })
      .sort({ createdAt: -1 }) 
      .skip(skip)
      .limit(limit)
      .populate('author', 'firstName lastName profile.profilePicture') 
      .populate({
        path: 'comments.user',
        select: 'firstName lastName profile.profilePicture', // Populate user inside comments
      })
      .lean();
  } 

  async isPostLikedByUser(postId: string, userId: string): Promise<boolean> {
    const post = await PostModel.findOne({
      _id: new Types.ObjectId(postId),
      "likes.userId": new Types.ObjectId(userId), // Accessing userId inside the likes array
    });
    return !!post;
  }

  async addLike(postId: string, userId: string): Promise<any> {
    try {
      return await PostModel.findByIdAndUpdate(
        postId,
        {
          $addToSet: { likes: { userId: new Types.ObjectId(userId), createdAt: new Date() } }, // Add an object to the likes array
        },
        { new: true }
      ).populate("author", "firstName lastName profile.profilePicture");
    } catch (error: any) {
      console.error("Error adding like:", error.message);
      throw new CustomError(
        "Failed to add like",
        HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async removeLike(postId: string, userId: string): Promise<any> {
    try {
      return await PostModel.findByIdAndUpdate(
        postId,
        {
          $pull: { likes: { userId: new Types.ObjectId(userId) } }, // Remove an object from the likes array
        },
        { new: true }
      ).populate("author", "firstName lastName profile.profilePicture");
    } catch (error: any) {
      console.error("Error removing like:", error.message);
      throw new CustomError(
        "Failed to remove like",
        HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async addComment(postId: string, userId: string, content: string): Promise<any> {
    try {
      const updatedPost = await PostModel.findByIdAndUpdate(
        postId,
        {
          $push: {
            comments: { user: new Types.ObjectId(userId), content, createdAt: new Date() },
          },
        },
        { new: true }
      ).populate("comments.user", "firstName lastName profile.profilePicture");
      return updatedPost;
    } catch (error: any) {
      console.error("Error adding comment:", error.message);
      throw new CustomError(
        "Failed to add comment",
        HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
  
}
