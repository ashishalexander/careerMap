export interface IPaymentService {
  createOrder(amount: number,currency: string,additionalOptions?: Record<string, any>): Promise<any>;
  verifyPayment(orderId: string, paymentId: string, signature: string): Promise<boolean>;
  updateSubscriptionAfterPayment(userId: string, planId: string, billingCycle: string,razorpay_payment_id:string,amount:any):Promise<any>
}