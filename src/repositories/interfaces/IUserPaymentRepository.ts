export interface IUserPaymentRepository {
    updateSubscription(params: {
      userId: string;
      planId: string;
      billingCycle: string;
      razorpay_payment_id:string;
      amount:any;
    }): Promise<any>;
  }
  