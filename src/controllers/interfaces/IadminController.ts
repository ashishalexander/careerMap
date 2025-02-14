import { Request, Response, NextFunction } from 'express';

export interface IAdminController {
    login(req: Request, res: Response, next: NextFunction): Promise<void>;
    refreshToken(req: Request, res: Response, next: NextFunction): void;
    fetchUsers(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    blockUser(req: Request, res: Response, next: NextFunction): Promise<void>;
}
