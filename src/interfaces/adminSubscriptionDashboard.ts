import { Types } from "mongoose";

export interface SubscriptionAnalytics {
  activeSubscriptions: number;
  totalRevenue: number;
  planCounts: {
    professional: number;
    recruiterPro: number;
  };
  revenueByPlan: {
    professional: number;
    recruiterPro: number;
  };
  monthlyGrowth: number;
  churnRate: number;
}


export interface SubscriptionFilters {
  search?: string;
  planType?: 'Professional' | 'recruiter-pro';
  status?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface ISubscriptionResponse {
  data: Array<{
    _id: Types.ObjectId;
    email: string;
    firstName: string;
    lastName: string;
    subscription: {
      planType: 'Professional' | 'recruiter-pro';
      billingCycle: 'monthly' | 'yearly';
      startDate: Date;
      endDate: Date;
      isActive: boolean;
      paymentHistory: Array<{
        amount: number;
        date: Date;
        transactionId: string;
      }>;
    };
  }>;
  total: number;
  page: number;
  limit: number;
}