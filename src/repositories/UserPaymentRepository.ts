import { UserModel } from '../models/userModel';  
import { IUserPaymentRepository } from './interfaces/IUserPaymentRepository';

export class UserPaymentRepository implements IUserPaymentRepository {
  async updateSubscription({
    userId,
    planId,
    billingCycle,
  }: {
    userId: string;
    planId: string;
    billingCycle: string;
  }): Promise<any> {
    try {
      // Fetch the user by their ID
      const user = await UserModel.findById(userId);

      if (!user) {
        throw new Error("User not found");
      }

      // Determine if the user already has an active subscription
      if (user.subscription && user.subscription.isActive) {
        // Extend the subscription validity
        const currentEndDate = user.subscription.endDate || new Date();
        user.subscription.endDate = this.calculateEndDate(billingCycle, new Date(currentEndDate));

        // Initialize paymentHistory if undefined
        if (!user.subscription.paymentHistory) {
          user.subscription.paymentHistory = [];
        }

        // Add new payment record
        user.subscription.paymentHistory.push({
          transactionId: "transaction-id-here", // Replace with actual transaction ID
          amount: 1000, // Replace with actual amount
          date: new Date(),
          billingCycle: billingCycle as "monthly" | "yearly",
          planType: planId as "Professional" | "recruiter-pro",
        });
      } else {
        // Create a new subscription if none exists
        user.subscription = {
          planType: planId as "Professional" | "recruiter-pro" | null,
          billingCycle: billingCycle as "monthly" | "yearly" | null,
          startDate: new Date(),
          endDate: this.calculateEndDate(billingCycle),
          isActive: true,
          paymentHistory: [
            {
              transactionId: "transaction-id-here",
              amount: 1000,
              date: new Date(),
              billingCycle: billingCycle as "monthly" | "yearly",
              planType: planId as "Professional" | "recruiter-pro",
            },
          ],
        };
      }

      // Save the updated user document
      await user.save();

      return user; // Return the updated user document
    } catch (error) {
      console.error("Error in UserPaymentRepository while updating subscription:", error);
      throw error;
    }
  }

  // Helper function to calculate subscription end date based on billing cycle
  private calculateEndDate(billingCycle: string, startFrom?: Date): Date {
    const startDate = startFrom || new Date();
    const endDate = new Date(startDate);

    if (billingCycle === "monthly") {
      endDate.setMonth(startDate.getMonth() + 1);
    } else if (billingCycle === "yearly") {
      endDate.setFullYear(startDate.getFullYear() + 1);
    }

    return endDate;
  }
}