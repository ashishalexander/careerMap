import { ISubscriptionExpiryRepository } from './interfaces/ISubscriptionExpiryRepository';
import { UserModel } from '../models/userModel';

export class SubscriptionExpiryRepository implements ISubscriptionExpiryRepository {
  async findExpiredSubscriptions(): Promise<string[]> {
    try {
      const expiredUsers = await UserModel.find({
        'subscription.isActive': true,
        'subscription.endDate': { $lt: new Date() }
      }, '_id');

      return expiredUsers.map(user => user._id.toString());
    } catch (error) {
      console.error('Error finding expired subscriptions:', error);
      throw error;
    }
  }

  async deactivateSubscription(userId: string): Promise<void> {
    try {
      await UserModel.findByIdAndUpdate(userId, {
        $set: {
          'subscription.isActive': false
        }
      });
    } catch (error) {
      console.error(`Error deactivating subscription for user ${userId}:`, error);
      throw error;
    }
  }
}
