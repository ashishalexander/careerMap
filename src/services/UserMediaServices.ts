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

  async fetchPosts(userId: string, page: number, limit: number): Promise<any> {
    const skip = (page - 1) * limit;

    try {
      // Fetch connections of the user
      const connections = await this.userMediaRepository.getUserConnections(userId);
      if (!connections || connections.length === 0) {
        return {
          posts: [],
          currentPage: page,
          nextPage: null,
        };
      }

      // Fetch posts of the connections
      const posts = await this.userMediaRepository.getPostsByConnections(
        connections,
        skip,
        limit
      );

      return {
        posts,
        currentPage: page,
        nextPage: posts.length === limit ? page + 1 : null,
      };
    } catch (error: any) {
      console.error('Error fetching posts:', error.message);
      throw new CustomError(
        "Failed to fetch posts",
        HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async toggleLike(postId: string, userId: string): Promise<any> {
    try {
      // Check if the user has already liked the post
      const isLiked = await this.userMediaRepository.isPostLikedByUser(postId, userId);

      if (isLiked) {
        // Unlike the post
        return await this.userMediaRepository.removeLike(postId, userId);
      } else {
        // Like the post
        return await this.userMediaRepository.addLike(postId, userId);
      }
    } catch (error: any) {
      console.error("Error toggling like:", error.message);
      throw new CustomError(
        "Failed to toggle like",
        HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async addComment(postId: string, userId: string, content: string): Promise<any> {
    if (!content.trim()) {
      throw new CustomError("Comment content cannot be empty", HttpStatusCodes.BAD_REQUEST);
    }
  
    return await this.userMediaRepository.addComment(postId, userId, content);
  }
  
}
