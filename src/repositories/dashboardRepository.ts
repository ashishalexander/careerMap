import { IdashboardRepository } from './interfaces/IdashboardRepository';
import { ConnectionStatusAggregation, DashboardMetrics, JobMetrics, MonthlyAggregationResult, MonthlyGrowthAggregation, NetworkActivityAggregation, NetworkMetrics, UserAggregation, UserGrowthMetrics } from '../interfaces/dashboard';
import { CustomError } from '../errors/customErrors';
import { HttpStatusCodes } from '../config/HttpStatusCodes';
import { UserModel} from '../models/userModel';
import { JobModel } from '../models/JobsModel';

export class dashboardRepository implements IdashboardRepository {
  async fetchMetrics(): Promise<DashboardMetrics> {
    try {
      // Get current date and last month's date
      const now = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      // Fetch total users (excluding blocked users)
      const totalUsersCount = await UserModel.countDocuments({ isblocked: false });
      const lastMonthUsers = await UserModel.countDocuments({
        isblocked: false,
        createdAt: { $lt: lastMonth }
      });

      // Fetch active users (users with active subscriptions)
      const activeUsersCount = await UserModel.countDocuments({
        isblocked: false,
        'subscription.isActive': true
      });
      const lastMonthActiveUsers = await UserModel.countDocuments({
        isblocked: false,
        'subscription.isActive': true,
        'subscription.startDate': { $lt: lastMonth }
      });

      // Calculate revenue from subscription payments
      const currentMonthRevenue = await UserModel.aggregate([
        {
          $match: {
            'subscription.paymentHistory': {
              $elemMatch: {
                date: { $gte: lastMonth, $lte: now }
              }
            }
          }
        },
        { $unwind: '$subscription.paymentHistory' },
        {
          $match: {
            'subscription.paymentHistory.date': { $gte: lastMonth, $lte: now }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$subscription.paymentHistory.amount' }
          }
        }
      ]);

      const previousMonthRevenue = await UserModel.aggregate([
        {
          $match: {
            'subscription.paymentHistory': {
              $elemMatch: {
                date: {
                  $gte: new Date(lastMonth.getTime() - 30 * 24 * 60 * 60 * 1000),
                  $lt: lastMonth
                }
              }
            }
          }
        },
        { $unwind: '$subscription.paymentHistory' },
        {
          $match: {
            'subscription.paymentHistory.date': {
              $gte: new Date(lastMonth.getTime() - 30 * 24 * 60 * 60 * 1000),
              $lt: lastMonth
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$subscription.paymentHistory.amount' }
          }
        }
      ]);

      // Calculate growth rates
      const userGrowthRate = ((totalUsersCount - lastMonthUsers) / lastMonthUsers) * 100;
      const currentRev = currentMonthRevenue[0]?.total || 0;
      const prevRev = previousMonthRevenue[0]?.total || 1; // Prevent division by zero
      const revenueGrowthRate = ((currentRev - prevRev) / prevRev) * 100;

      return {
        totalUsers: {
          value: totalUsersCount.toString(),
          trend: {
            type: totalUsersCount > lastMonthUsers ? 'increase' : 'decrease',
            value: `${Math.abs(((totalUsersCount - lastMonthUsers) / lastMonthUsers) * 100).toFixed(1)}%`
          }
        },
        activeUsers: {
          value: activeUsersCount.toString(),
          trend: {
            type: activeUsersCount > lastMonthActiveUsers ? 'increase' : 'decrease',
            value: `${Math.abs(((activeUsersCount - lastMonthActiveUsers) / lastMonthActiveUsers) * 100).toFixed(1)}%`
          }
        },
        revenue: {
          value: currentRev.toString(),
          trend: {
            type: currentRev > prevRev ? 'increase' : 'decrease',
            value: `${Math.abs(revenueGrowthRate).toFixed(1)}%`
          }
        },
        growthRate: {
          value: userGrowthRate.toFixed(1),
          trend: {
            type: userGrowthRate > 0 ? 'increase' : 'decrease',
            value: `${Math.abs(userGrowthRate).toFixed(1)}%`
          }
        }
      };
    } catch (error: any) {
      console.error('Error in MetricsRepository:', error.message);
      throw new CustomError(
        'Failed to fetch metrics data',
        HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async fetchJobMetrics(): Promise<JobMetrics> {
    try {
      const now = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      // Get basic job stats
      const totalJobs = await JobModel.countDocuments();
      const activeJobs = await JobModel.countDocuments({ status: 'active' });
      const completedJobs = await JobModel.countDocuments({ status: 'completed' });

      // Calculate job posting trends (last 6 months)
      const jobPostingTrends = await JobModel.aggregate([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              month: { $month: '$createdAt' },
              year: { $year: '$createdAt' }
            },
            postings: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            month: {
              $concat: [
                { $toString: '$_id.year' },
                '-',
                {
                  $cond: {
                    if: { $lt: ['$_id.month', 10] },
                    then: { $concat: ['0', { $toString: '$_id.month' }] },
                    else: { $toString: '$_id.month' }
                  }
                }
              ]
            },
            postings: 1
          }
        },
        { $sort: { month: 1 } }
      ]);

      // Calculate job type distribution
      const jobTypeDistribution = await JobModel.aggregate([
        {
          $group: {
            _id: '$jobType',
            value: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            name: '$_id',
            value: 1
          }
        }
      ]);

      // Calculate average completion time
      const completionTimeData = await JobModel.aggregate([
        {
          $match: {
            status: 'completed',
            completedAt: { $exists: true },
            createdAt: { $exists: true }
          }
        },
        {
          $group: {
            _id: null,
            avgTime: {
              $avg: { $subtract: ['$completedAt', '$createdAt'] }
            }
          }
        }
      ]);

      const averageCompletionTime = completionTimeData[0]?.avgTime || 0;

      // Calculate success rate
      const totalCompletedJobs = await JobModel.countDocuments({ status: 'completed' });
      const totalClosedJobs = await JobModel.countDocuments({
        status: { $in: ['completed', 'cancelled', 'failed'] }
      });
      const jobSuccessRate = totalClosedJobs > 0 
        ? (totalCompletedJobs / totalClosedJobs) * 100 
        : 0;

      return {
        jobPostingTrends,
        jobTypeDistribution,
        totalJobs,
        activeJobs,
        completedJobs,
        averageCompletionTime,
        jobSuccessRate
      };
    } catch (error: any) {
      throw new CustomError(
        'Failed to fetch job metrics',
        HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }


  async fetchNetworkMetrics(): Promise<NetworkMetrics> {
    try {
      const now = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      // Get connection activity over last 6 months
      const [networkActivity] = await UserModel.aggregate<NetworkActivityAggregation>([
        {
          $facet: {
            connections: [
              { $unwind: '$Network.connections' },
              {
                $match: {
                  'Network.connections.connectedAt': { $gte: sixMonthsAgo }
                }
              },
              {
                $group: {
                  _id: {
                    month: { $month: '$Network.connections.connectedAt' },
                    year: { $year: '$Network.connections.connectedAt' }
                  },
                  count: { $sum: 1 }
                }
              }
            ],
            requestsSent: [
              { $unwind: '$Network.pendingRequestsSent' },
              {
                $match: {
                  'Network.pendingRequestsSent.sentAt': { $gte: sixMonthsAgo }
                }
              },
              {
                $group: {
                  _id: {
                    month: { $month: '$Network.pendingRequestsSent.sentAt' },
                    year: { $year: '$Network.pendingRequestsSent.sentAt' }
                  },
                  count: { $sum: 1 }
                }
              }
            ],
            requestsReceived: [
              { $unwind: '$Network.pendingRequestsReceived' },
              {
                $match: {
                  'Network.pendingRequestsReceived.sentAt': { $gte: sixMonthsAgo }
                }
              },
              {
                $group: {
                  _id: {
                    month: { $month: '$Network.pendingRequestsReceived.sentAt' },
                    year: { $year: '$Network.pendingRequestsReceived.sentAt' }
                  },
                  count: { $sum: 1 }
                }
              }
            ]
          }
        }
      ]);

      // Process aggregation results into required format
      const months = new Set<string>();
      const activityMap = new Map<string, {
        month: string;
        connections: number;
        requestsSent: number;
        requestsReceived: number;
      }>();

      // Initialize the last 6 months regardless of data presence
      for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months.add(monthKey);
      }

      // Create base structure for each month
      months.forEach(month => {
        activityMap.set(month, {
          month,
          connections: 0,
          requestsSent: 0,
          requestsReceived: 0
        });
      });

      // Fill in the actual values
      networkActivity.connections.forEach((item: MonthlyAggregationResult) => {
        const monthKey = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
        if (activityMap.has(monthKey)) {
          activityMap.get(monthKey)!.connections = item.count;
        }
      });

      networkActivity.requestsSent.forEach((item: MonthlyAggregationResult) => {
        const monthKey = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
        if (activityMap.has(monthKey)) {
          activityMap.get(monthKey)!.requestsSent = item.count;
        }
      });

      networkActivity.requestsReceived.forEach((item: MonthlyAggregationResult) => {
        const monthKey = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
        if (activityMap.has(monthKey)) {
          activityMap.get(monthKey)!.requestsReceived = item.count;
        }
      });

      // Get current connection status counts
      const [connectionStatusData] = await UserModel.aggregate<ConnectionStatusAggregation>([
        {
          $facet: {
            activeConnections: [
              {
                $project: {
                  connectionCount: { $size: '$Network.connections' }
                }
              },
              {
                $group: {
                  _id: null,
                  total: { $sum: '$connectionCount' }
                }
              }
            ],
            pendingSent: [
              {
                $project: {
                  requestCount: { $size: '$Network.pendingRequestsSent' }
                }
              },
              {
                $group: {
                  _id: null,
                  total: { $sum: '$requestCount' }
                }
              }
            ],
            pendingReceived: [
              {
                $project: {
                  requestCount: { $size: '$Network.pendingRequestsReceived' }
                }
              },
              {
                $group: {
                  _id: null,
                  total: { $sum: '$requestCount' }
                }
              }
            ]
          }
        }
      ]);

      const connectionStatus = [
        {
          name: 'Active Connections',
          value: connectionStatusData?.activeConnections[0]?.total || 0
        },
        {
          name: 'Pending Sent',
          value: connectionStatusData?.pendingSent[0]?.total || 0
        },
        {
          name: 'Pending Received',
          value: connectionStatusData?.pendingReceived[0]?.total || 0
        }
      ];

      return {
        connectionActivity: Array.from(activityMap.values()).sort((a, b) => a.month.localeCompare(b.month)),
        connectionStatus
      };

    } catch (error: any) {
      console.error('Error in NetworkRepository:', error.message);
      throw new CustomError(
        'Failed to fetch network metrics data',
        HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }


  async fetchUserGrowthMetrics(): Promise<UserGrowthMetrics> {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      // Get monthly user growth data with improved role handling
      const monthlyGrowth = await UserModel.aggregate<MonthlyGrowthAggregation>([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              month: { $month: '$createdAt' },
              year: { $year: '$createdAt' },
              role: {
                $cond: {
                  if: { $eq: ['$role', 'recruiter'] },
                  then: 'recruiter',
                  else: 'user'
                }
              }
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: {
              month: '$_id.month',
              year: '$_id.year'
            },
            users: {
              $push: {
                role: '$_id.role',
                count: '$count'
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            month: {
              $concat: [
                { $toString: '$_id.year' },
                '-',
                {
                  $cond: {
                    if: { $lt: ['$_id.month', 10] },
                    then: { $concat: ['0', { $toString: '$_id.month' }] },
                    else: { $toString: '$_id.month' }
                  }
                }
              ]
            },
            users: 1
          }
        },
        { $sort: { month: 1 } }
      ]);

      // Get current user distribution with improved role handling
      const userDistribution = await UserModel.aggregate([
        {
          $match: {
            isblocked: false  // Only count non-blocked users
          }
        },
        {
          $group: {
            _id: {
              $cond: {
                if: { $eq: ['$role', 'recruiter'] },
                then: 'Recruiters',
                else: 'Regular Users'
              }
            },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            type: '$_id',
            count: 1
          }
        }
      ]);

      // Process monthly growth data
      const monthlyUserGrowth = monthlyGrowth.map((month) => {
        const recruiters = month.users.find(u => u.role === 'recruiter')?.count || 0;
        const regularUsers = month.users.find(u => u.role === 'user')?.count || 0;
        return {
          month: month.month,
          totalUsers: recruiters + regularUsers,
          recruiters,
          regularUsers
        };
      });

      // Fill in missing months
      const now = new Date();
      const months = new Set(monthlyUserGrowth.map(m => m.month));
      
      for (let i = 0; i < 6; i++) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!months.has(monthKey)) {
          monthlyUserGrowth.push({
            month: monthKey,
            totalUsers: 0,
            recruiters: 0,
            regularUsers: 0
          });
        }
      }

      // Sort by month
      monthlyUserGrowth.sort((a, b) => a.month.localeCompare(b.month));

      // Normalize distribution data
      const normalizedDistribution = [
        { type: 'Regular Users', count: userDistribution.find(d => d.type === 'Regular Users')?.count || 0 },
        { type: 'Recruiters', count: userDistribution.find(d => d.type === 'Recruiters')?.count || 0 }
      ];

      return {
        monthlyUserGrowth,
        userDistribution: normalizedDistribution
      };
    } catch (error: any) {
      console.error('Error in UserGrowthRepository:', error.message);
      throw new CustomError(
        'Failed to fetch user growth metrics data',
        HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}