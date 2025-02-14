import { Request, Response, NextFunction } from 'express';

export interface IUserMediaController {
  createPost(req: Request, res: Response, next: NextFunction): void;

  fetchPosts(req: Request, res: Response, next: NextFunction): Promise<void>;

  toggleLike(req: Request, res: Response, next: NextFunction): Promise<void>;

  addComment(req: Request, res: Response, next: NextFunction): Promise<void>;

  getUserPosts(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
