import { Request, Response, NextFunction } from 'express';

export interface IReportController {
  generateReport(req: Request, res: Response, next: NextFunction): Promise<void>;
}
