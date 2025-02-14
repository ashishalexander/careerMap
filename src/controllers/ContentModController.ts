import { NextFunction, Request, Response } from 'express';
import { IContentModService } from '../services/interfaces/IContentModService';
import { CustomError } from '../errors/customErrors';
import { HttpStatusCodes } from '../config/HttpStatusCodes';
import { IContentModController } from './interfaces/IContentModController';

export class ContentModController implements IContentModController{
  private ContModService: IContentModService;

  constructor(ContentModService: IContentModService) {
    this.ContModService = ContentModService;
  }

  async createReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { postId,userId,reason, details } = req.body;

      if (!userId) {
        throw new CustomError('Authentication required', HttpStatusCodes.UNAUTHORIZED);
      }

      const report = await this.ContModService.createReport(postId, userId, reason, details);

      res.status(HttpStatusCodes.CREATED).json({
        message: 'Report submitted successfully',
        data: report
      });
    } catch (error: any) {
      next(new CustomError(
        error.message || 'Internal Server Error',
        error.status || HttpStatusCodes.INTERNAL_SERVER_ERROR
      ));
    }
  }

  async getReports(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, page, limit } = req.query;

      const result = await this.ContModService.getReports({
        status: status as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined
      });

      res.status(HttpStatusCodes.OK).json({data :result});
    } catch (error: any) {
      next(new CustomError(
        error.message || 'Internal Server Error',
        error.status || HttpStatusCodes.INTERNAL_SERVER_ERROR
      ));
    }
  }

  async handleReportAction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { reportId } = req.params;
      const { action, response,isDeleted } = req.body;
      
      const updatedReport = await this.ContModService.handleReportAction(
        reportId,
        action,
        response,
        isDeleted,
      );
      console.log(isDeleted+"✌️")
      res.status(HttpStatusCodes.OK).json({
        message: 'Report action processed successfully',
        data: updatedReport
      });
    } catch (error: any) {
      next(new CustomError(
        error.message || 'Internal Server Error',
        error.status || HttpStatusCodes.INTERNAL_SERVER_ERROR
      ));
    }
  }

}