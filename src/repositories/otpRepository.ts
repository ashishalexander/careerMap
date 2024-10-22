import { OtpModel, IOtp } from '../models/otpModel';
import { MongoError } from 'mongodb';
import { CustomError } from '../errors/customErrors';
import { IOtpRepository } from './interfaces/IOtpRepository';


export class OtpRepository implements IOtpRepository {
  /**
   * Creates a new OTP entry in the database.
   * 
   * @param email - The email address associated with the OTP.
   * @param otp - The OTP code to be saved.
   * @param expiresAt - The expiration date and time for the OTP.
   * @returns A Promise that resolves to the created OTP entry.
   * @throws Error if there is an issue during the creation process or if an entry already exists.
   */
  async createOtpEntry(email: string, otp: string, expiresAt: Date): Promise<IOtp> {
    try {
      const otpEntry = new OtpModel({ email, otp, expiresAt });
      return await otpEntry.save();
    } catch (error) {
      console.error('Error creating OTP entry:', error);
      if (error instanceof MongoError && error.code === 11000) {
        throw new CustomError('OTP entry already exists for this email.', 409); 
      }
      throw new CustomError('Failed to create OTP entry', 500);
    }
  }
   /**
   * Finds the most recent OTP entry associated with the specified email.
   * 
   * @param email - The email address for which to find the OTP entry.
   * @returns A Promise that resolves to the found OTP entry, or null if not found.
   * @throws Error if there is an issue during the retrieval process.
   */
  async findOtpByEmail(email: string): Promise<IOtp | null> {
    try {
      return await OtpModel
          .findOne({ email })
          .sort({createdAt:-1})
          .exec();
    } catch (error) {
      console.error('Error finding OTP by email:', error);
      throw new CustomError('Failed to find OTP entry', 500); 
    }
  }

  
}
