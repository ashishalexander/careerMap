// src/repositories/interfaces/IAdminSubscriptionRepository.ts
import { IUser } from '../../models/userModel';
import { SubscriptionFilters, PaginationParams, SubscriptionAnalytics } from '../../interfaces/adminSubscriptionDashboard';

export interface ISubscriptionRepository {
  findAll(
    filters: SubscriptionFilters,
    paginationParams: PaginationParams
  ): Promise<{ data:IUser[] ; total: number }>;

  getAnalytics(timeframe: string ): Promise<SubscriptionAnalytics>

}