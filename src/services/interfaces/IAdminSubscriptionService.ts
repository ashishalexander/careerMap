import {  ISubscriptionResponse, PaginationParams, SubscriptionAnalytics, SubscriptionFilters } from "../../interfaces/adminSubscriptionDashboard";

export interface ISubscriptionService {
  getSubscriptions(filters: SubscriptionFilters, pagination: PaginationParams): Promise<ISubscriptionResponse>;
  getAnalytics(timeframe: 'Yearly' | 'weekly' | 'monthly' |'All Time'): Promise<SubscriptionAnalytics>
}