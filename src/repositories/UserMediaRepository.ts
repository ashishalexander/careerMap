import { IUserMediaRepository } from "./interfaces/IUserMediaRepository";
import { PostModel } from "../models/mediaModel";
import { IPost } from "../models/mediaModel";
import { CustomError } from "../errors/customErrors";
import { HttpStatusCodes } from "../config/HttpStatusCodes";

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
}
