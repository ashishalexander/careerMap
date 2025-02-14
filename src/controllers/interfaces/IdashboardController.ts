import { Request, Response, NextFunction } from "express";

export interface IDashboardController {
    getDashboardMetrics(req: Request, res: Response, next: NextFunction): Promise<void>;
    getJobMetrics(req: Request, res: Response, next: NextFunction): Promise<void>;
    getNetworkMetrics(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUserGrowthMetrics(req: Request, res: Response, next: NextFunction): Promise<void>;
}