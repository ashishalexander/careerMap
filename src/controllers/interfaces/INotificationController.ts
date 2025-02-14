import {Request, Response, NextFunction } from "express";

export interface INotificationController {
    createNotification(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllNotifications(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUserNotifications(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUserById(req: Request, res: Response, next: NextFunction): Promise<void>;
}