// src/repositories/reportRepository.ts
import { IReportRepository } from './interfaces/IReportRepository';
import { UserModel } from '../models/userModel';  
import {  ReportTimeframe, ReportOptions } from '../interfaces/reports';
import { CustomError } from '../errors/customErrors';

export class ReportRepository implements IReportRepository {
  async generateReportData(options: ReportOptions): Promise<any> {
    try {
      const { startDate, endDate } = this.getDateRange(options.timeframe, options.startDate, options.endDate);
      
      switch (options.reportType) {
        case 'userGrowth':
          return await this.generateUserGrowthReport(startDate, endDate);
        case 'revenue':
          return await this.generateRevenueReport(startDate, endDate);
        default:
          throw new CustomError('Invalid report type', 400);
      }
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Database error while generating report data', 500);
    }
  }

  private getDateRange(timeframe: ReportTimeframe, customStartDate?: string, customEndDate?: string): { startDate: Date, endDate: Date } {
    const endDate = new Date();
    let startDate = new Date();

    if (timeframe === 'custom' && customStartDate && customEndDate) {
      return {
        startDate: new Date(customStartDate),
        endDate: new Date(customEndDate)
      };
    }

    switch (timeframe) {
      case 'lastWeek':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'lastMonth':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case 'lastQuarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'ytd':
        startDate = new Date(endDate.getFullYear(), 0, 1); // January 1st of current year
        break;
      default:
        startDate.setDate(endDate.getDate() - 30); // Default to last 30 days
    }

    return { startDate, endDate };
  }

  private async generateUserGrowthReport(startDate: Date, endDate: Date): Promise<any> {
    // Aggregate user growth data
    const userGrowthData = await UserModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
      }
    ]);

    // Also get subscription data
    const subscriptionData = await UserModel.aggregate([
      {
        $match: {
          'subscription.startDate': { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$subscription.startDate" },
            month: { $month: "$subscription.startDate" },
            day: { $dayOfMonth: "$subscription.startDate" },
            planType: "$subscription.planType"
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
      }
    ]);

    return {
      title: "User Growth Report",
      dateRange: { startDate, endDate },
      userGrowth: userGrowthData,
      subscriptionGrowth: subscriptionData
    };
  }

  private async generateRevenueReport(startDate: Date, endDate: Date): Promise<any> {
    // Revenue from subscriptions during the period
    const revenueByPlan = await UserModel.aggregate([
      {
        $unwind: "$subscription.paymentHistory"
      },
      {
        $match: {
          "subscription.paymentHistory.date": { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$subscription.planType",
          totalRevenue: { $sum: "$subscription.paymentHistory.amount" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Daily revenue 
    const dailyRevenue = await UserModel.aggregate([
      {
        $unwind: "$subscription.paymentHistory"
      },
      {
        $match: {
          "subscription.paymentHistory.date": { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$subscription.paymentHistory.date" },
            month: { $month: "$subscription.paymentHistory.date" },
            day: { $dayOfMonth: "$subscription.paymentHistory.date" }
          },
          dailyRevenue: { $sum: "$subscription.paymentHistory.amount" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
      }
    ]);

    return {
      title: "Revenue Report",
      dateRange: { startDate, endDate },
      revenueByPlan,
      dailyRevenue,
      totalRevenue: revenueByPlan.reduce((sum, item) => sum + item.totalRevenue, 0)
    };
  }
}