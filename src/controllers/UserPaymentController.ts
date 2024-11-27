import { Request, Response, NextFunction } from "express";
import { IPaymentService } from "../services/interfaces/IUserPaymentService";
import { CustomError } from "../errors/customErrors";
import { HttpStatusCodes } from "../config/HttpStatusCodes";

export class UserPaymentController {
  constructor(private paymentService: IPaymentService) {}

  /**
   * Create a Razorpay order.
   * @param req - Express request object.
   * @param res - Express response object.
   * @param next - Express next middleware function.
   */
  async createOrder(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const { amount, currency } = req.body;

    if (!amount || !currency) {
      return next(new CustomError("Amount and currency are required", HttpStatusCodes.BAD_REQUEST));
    }

    try {
      const order = await this.paymentService.createOrder(amount, currency);

      return res.status(HttpStatusCodes.OK).json({
        message: "Order created successfully",
        data: order,
      });
    } catch (error) {
      console.error("Error in PaymentController while creating order:", error);
      return next(new CustomError("Failed to create order", HttpStatusCodes.INTERNAL_SERVER_ERROR));
    }
  }

  /**
   * Handle Razorpay payment verification (optional).
   * @param req - Express request object.
   * @param res - Express response object.
   * @param next - Express next middleware function.
   */
  async verifyPayment(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, planId, billingCycle } = req.body;
    console.log(req.body)
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return next(new CustomError("Invalid payment verification data", HttpStatusCodes.BAD_REQUEST));
    }

    try {
      // Verify payment signature
      const isValid = await this.paymentService.verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);

      if (!isValid) {
        return next(new CustomError("Invalid payment verification", HttpStatusCodes.UNAUTHORIZED));
      }

      // Update the subscription after successful payment verification
      const updatedSubscription = await this.paymentService.updateSubscriptionAfterPayment(userId, planId, billingCycle);
      
      return res.status(HttpStatusCodes.OK).json({
        message: "Payment verified successfully",
        data: updatedSubscription,  // Send back the updated subscription details
      });
    } catch (error) {
      console.error("Error in PaymentController while verifying payment:", error);
      return next(new CustomError("Payment verification failed", HttpStatusCodes.INTERNAL_SERVER_ERROR));
    }
  }
}
