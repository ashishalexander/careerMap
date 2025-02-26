import cron from 'node-cron';
import { SubscriptionExpiryService } from '../services/SubscriptionExpiryService';
import { SubscriptionExpiryRepository } from '../repositories/SubscriptionExpiryRepository';
import logger from '../middleware/logger';

export const initializeSubscriptionExpiryCron = () => {
  const repository = new SubscriptionExpiryRepository();
  const service = new SubscriptionExpiryService(repository);

  // Run every day at midnight (00:00)
  cron.schedule('0 0 * * *', async () => {
    logger.info('Starting subscription expiry check');
    try {
      await service.checkAndExpireSubscriptions();
      logger.info('Completed subscription expiry check');
    } catch (error) {
      logger.error('Error in subscription expiry cron job:', error);
    }
  });
};
