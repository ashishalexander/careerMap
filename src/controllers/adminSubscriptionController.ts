// src/controllers/SubscriptionController.ts
import { Request, Response } from 'express';
import { ISubscriptionService } from '../services/interfaces/IAdminSubscriptionService';
import { NextFunction } from 'express-serve-static-core';
import { ISubscriptionController } from './interfaces/IadminSubCtrl';

export class SubscriptionController implements ISubscriptionController {
  constructor(private subscriptionService: ISubscriptionService) {}

  getSubscriptions = async (req: Request, res: Response,next:NextFunction) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const filters = {
        search: req.query.search as string,
        planType: req.query.planType as 'Professional' | 'Recruiter Pro',
        status: true,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      };

      const result = await this.subscriptionService.getSubscriptions(
        filters,
        { page: Number(page), limit: Number(limit) }
      );
      console.log(result)
      res.status(200).json({data:result});
    } catch (error) {
      next(error)
    }
  };

  getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { timeframe = 'All Time' } = req.query;
      console.log(timeframe)
      const analytics = await this.subscriptionService.getAnalytics(timeframe as 'Yearly' | 'weekly' | 'monthly'|'All Time');
      res.status(200).json({data:analytics});
    } catch (error) {
      next(error);
    }
  };

  
}