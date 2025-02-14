import { NextFunction, Request, Response } from 'express';
import { IdashboardService } from '../services/interfaces/IdashboardService';
import { CustomError } from '../errors/customErrors';
import { HttpStatusCodes } from '../config/HttpStatusCodes';
import { IDashboardController } from './interfaces/IdashboardController';

export class dashboardController implements IDashboardController {
  private metricsService: IdashboardService;

  constructor(metricsService: IdashboardService) {
    this.metricsService = metricsService;
  }

  async getDashboardMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const metrics = await this.metricsService.getDashboardMetrics();

      res.status(HttpStatusCodes.OK).json({
        message: 'Dashboard metrics fetched successfully',
        data: metrics,
      });
    } catch (error: any) {
      console.error('Error fetching dashboard metrics:', error.message);
      next(
        new CustomError(
          error.message || 'Internal Server Error',
          error.status || HttpStatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    }
  }

  async getJobMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const metrics = await this.metricsService.getJobMetrics();
      res.status(HttpStatusCodes.OK).json({
        message: 'Job metrics fetched successfully',
        data: metrics,
      });
    } catch (error: any) {
      next(new CustomError(
        error.message || 'Internal Server Error',
        error.status || HttpStatusCodes.INTERNAL_SERVER_ERROR
      ));
    }
  }

  async getNetworkMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const metrics = await this.metricsService.getNetworkMetrics();

      res.status(HttpStatusCodes.OK).json({
        message: 'Network metrics fetched successfully',
        data: metrics,
      });
    } catch (error: any) {
      console.error('Error fetching network metrics:', error.message);
      next(
        new CustomError(
          error.message || 'Internal Server Error',
          error.status || HttpStatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    }
  }

  async getUserGrowthMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const metrics = await this.metricsService.getUserGrowthMetrics();
      console.log(metrics)
      res.status(HttpStatusCodes.OK).json({
        message: 'User growth metrics fetched successfully',
        data: metrics,
      });
    } catch (error: any) {
      next(new CustomError(
        error.message || 'Failed to fetch user growth metrics',
        error.status || HttpStatusCodes.INTERNAL_SERVER_ERROR
      ));
    }
  }
}