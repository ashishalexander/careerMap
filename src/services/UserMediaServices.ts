import { IUserMediaService } from "./interfaces/IUserMediaService";
import { IUserMediaRepository } from "../repositories/interfaces/IUserMediaRepository";
import { IPost } from "../models/mediaModel";
import { CustomError } from "../errors/customErrors";
import { HttpStatusCodes } from "../config/HttpStatusCodes";
import { Types } from "mongoose";
export class UserMediaService implements IUserMediaService {
  private userMediaRepository: IUserMediaRepository;

  constructor(userMediaRepository: IUserMediaRepository) {
    this.userMediaRepository = userMediaRepository;
  }

  async createPost(userId: string, newPost: Partial<IPost>): Promise<any> {
    // Ensure the post has either text or media
    if (!newPost.text && !newPost.media) {
      throw new CustomError(
        "Post must contain text or media",
        HttpStatusCodes.BAD_REQUEST
      );
    }

    const post = {
      author: new Types.ObjectId(userId),
      text: newPost.text || undefined,
      media: newPost.media || undefined,
      createdAt: new Date(),
    };

    try {
      // Pass the post object to the repository
      const createdPost = await this.userMediaRepository.create(post);
      return createdPost;
    } catch (error: any) {
      console.error("Error creating post:", error.message);
      throw new CustomError(
        "Failed to create post",
        HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}
