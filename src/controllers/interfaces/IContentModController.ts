import { Request, Response, NextFunction } from "express";

export interface IContentModController {
    createReport(req: Request, res: Response, next: NextFunction): Promise<void>;
    getReports(req: Request, res: Response, next: NextFunction): Promise<void>;
    handleReportAction(req: Request, res: Response, next: NextFunction): Promise<void>;
}