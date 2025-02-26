// src/repositories/adminSubscriptionRepository.ts
import { ISubscriptionRepository } from './interfaces/IadminSubscriptionRepository';
import { UserModel, IUser } from '../models/userModel';
import { SubscriptionFilters, PaginationParams, SubscriptionAnalytics } from '../interfaces/adminSubscriptionDashboard';
import { CustomError } from '../errors/customErrors';

export class SubscriptionRepository implements ISubscriptionRepository {
  async findAll(
    filters: SubscriptionFilters,
    { page, limit }: PaginationParams
  ): Promise<{ data: IUser[]; total: number }> {
    try {
      const query: any = { 
        'subscription.planType': { $in: ['Professional', 'Recruiter Pro'] } 
      };
  
      if (filters.search) {
        query.$or = [
          { email: { $regex: filters.search, $options: 'i' } },
          { firstName: { $regex: filters.search, $options: 'i' } },
          { lastName: { $regex: filters.search, $options: 'i' } }
        ];
      }
  
      if (filters.planType) {
        query['subscription.planType'] = filters.planType;
      }
  
      if (filters.status !== undefined) {
        query['subscription.isActive'] = filters.status;
      }
  
      if (filters.startDate) {
        query['subscription.startDate'] = filters.startDate;
      }
     
  
      const [total, data] = await Promise.all([
        UserModel.countDocuments(query),
        UserModel.find(query)
          .select('firstName lastName email subscription')
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({ 'subscription.startDate': -1 })
      ]);
  
      return { data, total };
    } catch (error) {
      throw new CustomError('Database error while fetching subscriptions', 500);
    }
  }
  async getAnalytics(timeframe: string ): Promise<SubscriptionAnalytics> {
    const now = new Date();
    const startDate = this.getStartDate(timeframe, now);

    try {
      const [
        activeSubscriptionStats,
        revenueStats,
        previousPeriodStats,
        cancelledSubscriptions
      ] = await Promise.all([
        // Active subscriptions and plan counts
        UserModel.aggregate([
          {
            $match: {
              'subscription.isActive': true,
              'subscription.startDate': { $lte: now }
            }
          },
          {
            $group: {
              _id: '$subscription.planType',
              count: { $sum: 1 }
            }
          }
        ]),

        // Revenue calculation with modified date matching
        UserModel.aggregate([
          {
            $match: {
              'subscription.paymentHistory': { $exists: true, $ne: [] }
            }
          },
          {
            $unwind: '$subscription.paymentHistory'
          },
          {
            $match: timeframe.toLowerCase() === 'all time' 
              ? {} // No date filtering for all time
              : {
                  'subscription.paymentHistory.date': {
                    $gte: startDate,
                    $lte: now
                  }
                }
          },
          {
            $group: {
              _id: '$subscription.paymentHistory.planType',
              revenue: {
                $sum: '$subscription.paymentHistory.amount'
              }
            }
          }
        ]),

        // Previous period stats
        UserModel.countDocuments({
          'subscription.isActive': true,
          'subscription.startDate': {
            $lte: startDate
          }
        }),

        // Churn calculation
        UserModel.countDocuments({
          'subscription.isActive': false,
          'subscription.endDate': { $gte: startDate, $lte: now }
        })
      ]);

      // Process subscription stats
      const planCounts = {
        professional: 0,
        recruiterPro: 0
      };
      
      const revenueByPlan = {
        professional: 0,
        recruiterPro: 0
      };

      // Map active subscription counts
      activeSubscriptionStats.forEach((stat: any) => {
        const plan = stat._id.toLowerCase() === 'professional' ? 'professional' : 'recruiterPro';
        planCounts[plan] = stat.count;
      });

      // Map revenue by plan
      revenueStats.forEach((stat: any) => {
        if (stat._id) {
          const plan = stat._id.toLowerCase() === 'professional' ? 'professional' : 'recruiterPro';
          revenueByPlan[plan] = stat.revenue || 0;
        }
      });

      const activeSubscriptions = Object.values(planCounts).reduce((a, b) => a + b, 0);
      const totalRevenue = Object.values(revenueByPlan).reduce((a, b) => a + b, 0);

      // Calculate growth rate
      const monthlyGrowth = previousPeriodStats > 0
        ? ((activeSubscriptions - previousPeriodStats) / previousPeriodStats) * 100
        : 0;

      // Calculate churn rate
      const churnRate = activeSubscriptions > 0
        ? (cancelledSubscriptions / activeSubscriptions) * 100
        : 0;

      return {
        activeSubscriptions,
        totalRevenue,
        planCounts,
        revenueByPlan,
        monthlyGrowth,
        churnRate
      };
    } catch (error) {
      throw new Error('Failed to fetch analytics data');
    }
  }

  private getStartDate(timeframe: string, now: Date): Date {
    const startDate = new Date(now);
    
    switch (timeframe.toLowerCase()) {
      case 'all time':
        return new Date(0); // Returns the earliest possible date
      case 'yearly':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'weekly':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }
    return startDate;
  }
}
  
