import { Request, Response, NextFunction } from "express";

export interface ISubscriptionController {
    getSubscriptions(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void>;
}