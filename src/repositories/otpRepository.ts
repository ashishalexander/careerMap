// src/repositories/otpRepository.ts
import { OtpModel, IOtp } from '../models/otpModel';
import { MongoError } from 'mongodb';


export class OtpRepository {
  // Method to create an OTP entry
  async createOtpEntry(email: string, otp: string, expiresAt: Date): Promise<IOtp> {
    try {
      const otpEntry = new OtpModel({ email, otp, expiresAt });
      return await otpEntry.save();
    } catch (error) {
      console.error('Error creating OTP entry:', error);
       if (error instanceof MongoError && error.code === 11000) {
        throw new Error('OTP entry already exists for this email.'); // Handle duplicate error
      }
      throw new Error('Failed to create OTP entry'); 
    }
  }

  // Method to find an OTP entry by email
  async findOtpByEmail(email: string): Promise<IOtp | null> {
    try {
      return await OtpModel
          .findOne({ email })
          .sort({createdAt:-1})
          .exec();
    } catch (error) {
      console.error('Error finding OTP by email:', error);
      throw new Error('Failed to find OTP entry'); 
    }
  }

  
}
