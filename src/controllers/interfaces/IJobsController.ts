import { Request, Response, NextFunction } from "express";

export interface IJobController {
    createJob(req: Request, res: Response, next: NextFunction): Promise<void>;
    fetchAllJobs(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteJob(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateJob(req: Request, res: Response, next: NextFunction): Promise<void>;
    fetchJob(req: Request, res: Response, next: NextFunction): Promise<void>;
}