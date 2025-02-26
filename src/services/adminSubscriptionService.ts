import { 
  ISubscriptionResponse, 
  SubscriptionFilters,
  PaginationParams, 
  SubscriptionAnalytics
} from '../interfaces/adminSubscriptionDashboard';
import { CustomError } from '../errors/customErrors';
import { ISubscriptionService } from './interfaces/IAdminSubscriptionService';
import { ISubscriptionRepository } from '../repositories/interfaces/IadminSubscriptionRepository';
import { IUser } from '../models/userModel';

export class SubscriptionService implements ISubscriptionService {
  constructor(private subscriptionRepository: ISubscriptionRepository) {}

  async getSubscriptions(
    filters: SubscriptionFilters,
    paginationParams: PaginationParams
  ): Promise<ISubscriptionResponse> {
    try {
      const { data, total } = await this.subscriptionRepository.findAll(filters, paginationParams);
      
      
      // Map IUser to expected response type
      const mappedData = data.map(this.mapUserToSubscriptionResponse);
      
      return {
        data: mappedData,
        total,
        page: paginationParams.page,
        limit: paginationParams.limit
      };
    } catch (error) {
      throw new CustomError('Failed to fetch subscriptions', 500);
    }
  }

  private mapUserToSubscriptionResponse(user: IUser) {
    if (!user.subscription) {
      throw new CustomError('User subscription is undefined', 500);
    }

    return {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      subscription: {
        planType: user.subscription.planType as 'Professional' | 'recruiter-pro',
        billingCycle: user.subscription.billingCycle as 'monthly' | 'yearly',
        startDate: user.subscription.startDate || new Date(),
        isActive: user.subscription.isActive,
        paymentHistory: (user.subscription.paymentHistory || []).map(payment => ({
          amount: payment.amount,
          date: payment.date,
          transactionId: payment.transactionId
        }))
      }
    };
  }

  async getAnalytics(timeframe: 'All Time'|'Yearly' | 'weekly' | 'monthly' = 'monthly'): Promise<SubscriptionAnalytics> {
    try {
      return await this.subscriptionRepository.getAnalytics(timeframe);
    } catch (error) {
      throw new CustomError('Failed to fetch analytics', 500);
    }
  }

  
}