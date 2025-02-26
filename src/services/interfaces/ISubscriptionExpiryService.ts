export interface ISubscriptionExpiryService {
    checkAndExpireSubscriptions(): Promise<void>;
    deactivateExpiredSubscription(userId: string): Promise<void>;
  }