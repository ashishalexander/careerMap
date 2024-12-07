import { IUserMediaRepository } from "./interfaces/IUserMediaRepository";
import { PostModel } from "../models/mediaModel";
import { IPost } from "../models/mediaModel";
import { CustomError } from "../errors/customErrors";
import { HttpStatusCodes } from "../config/HttpStatusCodes";
import { UserModel } from "../models/userModel";
import mongoose from "mongoose";

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
    console.log(userId+'👌')
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
    return await PostModel.find({ author: { $in: connections } })
      .sort({ createdAt: -1 }) 
      .skip(skip)
      .limit(limit)
      .populate('author', 'firstName lastName profile.profilePicture') 
      .lean();
  } 
}
