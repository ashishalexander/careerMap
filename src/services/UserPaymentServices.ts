import Razorpay from "razorpay";
import { CustomError } from "../errors/customErrors";
import { HttpStatusCodes } from "../config/HttpStatusCodes";
import * as crypto from "crypto";  
import { IPaymentService } from "./interfaces/IUserPaymentService";
import {IUserPaymentRepository} from '../repositories/interfaces/IUserPaymentRepository'
import dotenv from 'dotenv';
import { promises } from "dns";
dotenv.config();
export class UserPaymentService implements IPaymentService {
  private razorpay: any; // Use 'any' for a flexible approach
  private UserPaymentRepository: IUserPaymentRepository; // Declare the repository


  constructor(UserPaymentRepository: IUserPaymentRepository) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    this.UserPaymentRepository = UserPaymentRepository;


    if (!keyId || !keySecret) {
      throw new Error("Razorpay key_id and key_secret must be defined");
    }

    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  async createOrder(
    amount: number, 
    currency: string = 'INR', 
    additionalOptions: Record<string, any> = {}
  ): Promise<any> {
    try {
      // Basic validations
      if (amount <= 0) {
        throw new CustomError("Amount must be a positive number", HttpStatusCodes.BAD_REQUEST);
      }

      const options = {
        amount: Math.round(amount * 100), // Convert to paise
        currency,
        receipt: `receipt_${Date.now()}`,
        ...additionalOptions,
      };

      return await this.razorpay.orders.create(options);
    } catch (error) {
      console.error("Error in PaymentService while creating order:", error);
      throw new CustomError(
        error instanceof Error ? error.message : "Failed to create order", 
        HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async verifyPayment(orderId: string, paymentId: string, signature: string): Promise<boolean> {
    try {
      const body = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
        .update(body)
        .digest("hex");

      return expectedSignature === signature;
    } catch (error) {
      console.error("Error in PaymentService while verifying payment:", error);
      throw new CustomError("Payment verification failed", HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async updateSubscriptionAfterPayment(userId: string, planId: string, billingCycle: string):Promise<any> {
    try {
      return await this.UserPaymentRepository.updateSubscription({ userId, planId, billingCycle });
    } catch (error) {
      console.error("Error in PaymentService while updating subscription:", error);
      throw new CustomError("Error updating subscription", HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}


