import { Request, Response, NextFunction } from "express";

export interface IChatController {
    getConnectedUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
    getChatRooms(req: Request, res: Response, next: NextFunction): Promise<void>;
    createChatRoom(req: Request, res: Response, next: NextFunction): Promise<void>;
    getChatHistory(req: Request, res: Response, next: NextFunction): Promise<void>;
}