export interface IUserPaymentRepository {
    updateSubscription(params: {
      userId: string;
      planId: string;
      billingCycle: string;
    }): Promise<any>;
  }
  