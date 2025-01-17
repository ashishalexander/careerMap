import { IUserMediaService } from "./interfaces/IUserMediaService";
import { IUserMediaRepository } from "../repositories/interfaces/IUserMediaRepository";
import { IPost } from "../models/mediaModel";
import { CustomError } from "../errors/customErrors";
import { HttpStatusCodes } from "../config/HttpStatusCodes";
import { Types } from "mongoose";
import { NotificationSocketHandler } from "../sockets/NotificationSocketHandler";
import { IUserNotification } from "../models/userNotificationSchema";
export class UserMediaService implements IUserMediaService {
  private userMediaRepository: IUserMediaRepository;
  private notificationSocketHandler:NotificationSocketHandler

  constructor(userMediaRepository: IUserMediaRepository,notificationSocketHandler:NotificationSocketHandler) {
    this.userMediaRepository = userMediaRepository;
    this.notificationSocketHandler=notificationSocketHandler;
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
      const post = await this.userMediaRepository.getPostById(postId);
      if (!post) {
        throw new CustomError("Post not found", HttpStatusCodes.NOT_FOUND);
      }
      // Check if the user has already liked the post
      const isLiked = await this.userMediaRepository.isPostLikedByUser(postId, userId);
      let result
      if (isLiked) {
        // Unlike the post
        return await this.userMediaRepository.removeLike(postId, userId);
      } else {
        result = await this.userMediaRepository.addLike(postId, userId);

        // Only send notification if the post author exists and is not the same as the liker
        if (post.author && post.author.toString() !== userId) {
          // Create notification object
          const notification: Partial<IUserNotification> = {
            type: "like",
            postId,
            senderId: userId,
            receiverId: post.author.toString(),
            message: `User ${userId} liked your post`,
            createdAt: new Date(),
          };

          // Save notification to database
          await this.userMediaRepository.saveNotification(notification);

          // Send real-time notification through socket
          this.notificationSocketHandler.sendLikeNotification(
            post.author.toString(),
            userId,
            postId
          );
        }
        return result
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
    try {
      if (!content.trim()) {
        throw new CustomError("Comment content cannot be empty", HttpStatusCodes.BAD_REQUEST);
      }
  
      const post = await this.userMediaRepository.getPostById(postId); // Fetch post details
      if (!post) throw new CustomError("Post not found", HttpStatusCodes.NOT_FOUND);
  
      const updatedPost = await this.userMediaRepository.addComment(postId, userId, content);
      
        // Create notification
    if (post.author) {
      const notification: Partial<IUserNotification> = {
        type: "comment",
        postId,
        senderId: userId,
        receiverId: post.author.toString(),
        message: `User ${userId} commented on your post: "${content}"`,
        createdAt: new Date(),
      };

      // Save notification and send it
      const savedNotification = await this.userMediaRepository.saveNotification(notification);
      this.notificationSocketHandler.sendCommentNotification(
        post.author.toString(), // Use post.author directly since we checked it exists
        userId,
        postId,
        content
      );
    }
      
      return updatedPost;
    } catch (error: any) {
      console.error("Error adding comment:", error.message);
      throw new CustomError(
        "Failed to add comment",
        HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getUserPosts(userId: string): Promise<any> {
    try {
      const posts = await this.userMediaRepository.getUserPosts(userId);
      return posts;
    } catch (error) {
      console.error("Error fetching user posts:", error);
      throw new CustomError(
        "Failed to fetch user posts",
        HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
  
}
