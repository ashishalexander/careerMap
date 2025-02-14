import { Request, Response, NextFunction } from "express";

export interface IJobApplicationController {
    applyForJob(req: Request, res: Response, next: NextFunction): Promise<void>;
    hasApplied(req: Request, res: Response, next: NextFunction): Promise<void>;
    getJobApplications(req: Request, res: Response, next: NextFunction): Promise<void>;
    getRecruiterJobs(req: Request, res: Response, next: NextFunction): Promise<void>;
}