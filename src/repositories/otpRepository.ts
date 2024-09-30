// src/repositories/otpRepository.ts
import { OtpModel, IOtp } from '../models/otpModel';

export class OtpRepository {
  // Method to create an OTP entry
  async createOtpEntry(email: string, otp: string, expiresAt: Date): Promise<IOtp> {
    try {
      const otpEntry = new OtpModel({ email, otp, expiresAt });
      return await otpEntry.save();
    } catch (error) {
      console.error('Error creating OTP entry:', error);
      throw new Error('Failed to create OTP entry'); // Propagate the error to the service layer
    }
  }

  // Method to find an OTP entry by email
  async findOtpByEmail(email: string): Promise<IOtp | null> {
    try {
      return await OtpModel.findOne({ email }).exec();
    } catch (error) {
      console.error('Error finding OTP by email:', error);
      throw new Error('Failed to find OTP entry'); // Propagate the error to the service layer
    }
  }
}
