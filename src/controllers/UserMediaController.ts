import { NextFunction, Request, Response } from 'express';
import upload from '../middleware/multer-s3';
import { IUserMediaService } from '../services/interfaces/IUserMediaService';
import { CustomError } from '../errors/customErrors';
import { HttpStatusCodes } from '../config/HttpStatusCodes';
import { MediaType } from '../models/mediaModel';

export class UserMediaController {
  private userMediaService: IUserMediaService;

  constructor(userMediaService: IUserMediaService) {
    this.userMediaService = userMediaService;
  }

  createPost(req: Request, res: Response, next: NextFunction): void {
    upload.single('media')(req, res, async (err: any) => {
      if (err) {
        return next(
          new CustomError(
            `File upload failed: ${err.message}`,
            HttpStatusCodes.BAD_REQUEST
          )
        );
      }

      try {
        const { userId } = req.params;
        const { text, mediaDescription } = req.body;

        if (!userId) {
          throw new CustomError('User ID is required', HttpStatusCodes.BAD_REQUEST);
        }

        const media:any = req.file; // Multer S3 stores the file URL in `file.location`
        const newPost = {
          text: text?.trim() || undefined,
          media: media
            ? {
                type: MediaType.IMAGE, 
                url: media.location,
                description: mediaDescription?.trim() || undefined,
              }
            : undefined,
        };

        const createdPost = await this.userMediaService.createPost(userId, newPost);

        res.status(HttpStatusCodes.CREATED).json({
          message: 'Post created successfully',
          data: createdPost,
        });
      } catch (error: any) {
        console.error('Error creating post:', error.message);
        next(
          new CustomError(
            error.message || 'Internal Server Error',
            error.status || HttpStatusCodes.INTERNAL_SERVER_ERROR
          )
        );
      }
    });
  }

  async fetchPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      if (!userId) {
        throw new CustomError('User ID is required', HttpStatusCodes.BAD_REQUEST);
      }

      const posts = await this.userMediaService.fetchPosts(userId, +page, +limit);
      console.log(posts)

      res.status(HttpStatusCodes.OK).json({
        message: 'Posts fetched successfully',
        data: posts,
      });
    } catch (error: any) {
      console.error('Error fetching posts:', error.message);
      next(
        new CustomError(
          error.message || 'Internal Server Error',
          error.status || HttpStatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    }
  }

  async toggleLike(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { postId, userId } = req.params;

      if (!postId || !userId) {
        throw new CustomError("Post ID and User ID are required", HttpStatusCodes.BAD_REQUEST);
      }

      const updatedPost = await this.userMediaService.toggleLike(postId, userId);

      res.status(HttpStatusCodes.OK).json({
        message: "Post like status updated successfully",
        data: updatedPost,
      });
    } catch (error: any) {
      console.error("Error toggling like:", error.message);
      next(
        new CustomError(
          error.message || "Internal Server Error",
          error.status || HttpStatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    }
  }

  async addComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { postId } = req.params;
      const { content, userId } = req.body;
  
      if (!postId || !userId || !content) {
        throw new CustomError(
          "Post ID, User ID, and content are required",
          HttpStatusCodes.BAD_REQUEST
        );
      }
  
      const updatedPost = await this.userMediaService.addComment(postId, userId, content);
  
      res.status(HttpStatusCodes.OK).json({
        message: "Comment added successfully",
        data: updatedPost,
      });
    } catch (error: any) {
      console.error("Error adding comment:", error.message);
      next(
        new CustomError(
          error.message || "Internal Server Error",
          error.status || HttpStatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    }
  }
  

}
