import { ISubscriptionExpiryService } from './interfaces/ISubscriptionExpiryService';
import { ISubscriptionExpiryRepository } from '../repositories/interfaces/ISubscriptionExpiryRepository';
import logger from '../middleware/logger';

export class SubscriptionExpiryService implements ISubscriptionExpiryService {
  constructor(private subscriptionExpiryRepository: ISubscriptionExpiryRepository) {}

  async checkAndExpireSubscriptions(): Promise<void> {
    try {
      const expiredUserIds = await this.subscriptionExpiryRepository.findExpiredSubscriptions();
      
      for (const userId of expiredUserIds) {
        await this.deactivateExpiredSubscription(userId);
      }

      logger.info(`Processed ${expiredUserIds.length} expired subscriptions`);
    } catch (error) {
      logger.error('Error in subscription expiry check:', error);
      throw error;
    }
  }

  async deactivateExpiredSubscription(userId: string): Promise<void> {
    try {
      await this.subscriptionExpiryRepository.deactivateSubscription(userId);
      logger.info(`Deactivated subscription for user ${userId}`);
    } catch (error) {
      logger.error(`Error deactivating subscription for user ${userId}:`, error);
      throw error;
    }
  }
}
