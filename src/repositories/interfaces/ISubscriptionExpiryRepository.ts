export interface ISubscriptionExpiryRepository {
    findExpiredSubscriptions(): Promise<string[]>;
    deactivateSubscription(userId: string): Promise<void>;
  }