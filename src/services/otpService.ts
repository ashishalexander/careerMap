import { IOtp } from '../models/otpModel';
import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
import { CustomError } from '../errors/customErrors';
import dotenv from 'dotenv';
import { IOtpService } from './interfaces/IOtpService';
import { IOtpRepository } from '../repositories/interfaces/IOtpRepository';
import { HttpStatusCodes } from '../config/HttpStatusCodes'; 


dotenv.config();

export class OtpService implements IOtpService{
  constructor(private otpRepository: IOtpRepository) {}
  /**
   * Generates and stores an OTP for the given email, and sends it via email.
   * 
   * @param email - The email address for which OTP is generated.
   * @throws Error if the OTP creation or email sending process fails.
   */
  async createOtpEntry(email: string): Promise<void> {
    try {
      let  otpdata = await this.otpRepository.findOtpByEmail(email)
      while (otpdata) {
        console.log(`Waiting for previous OTP for ${email} to expire...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Check every 1 second
        otpdata = await this.otpRepository.findOtpByEmail(email); // Re-check
    }
      const otp: string = Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt: Date = new Date(Date.now() + 30 * 1000); // Set expiry for 30 seconds

      const otpDocument:IOtp=await this.otpRepository.createOtpEntry(email, otp, expiresAt);
      console.log(`OTP for ${email}: ${otp}`);
      await this.sendOtpEmail(email, otp);

      setTimeout(async () => {
        await this.otpRepository.deleteOtpById(otpDocument._id);
        console.log(`Deleted OTP for ${email} after 30 seconds`);
      }, 30000);

    } catch (error) {
      console.error('Error in OtpService while creating OTP:', error);
      throw new CustomError('Failed to create OTP entry in the service layer', HttpStatusCodes.INTERNAL_SERVER_ERROR); 
    }
  }

  /**
   * Sends the OTP via email using nodemailer.
   * 
   * @param email - The recipient email address.
   * @param otp - The OTP to be sent.
   * @throws Error if email sending fails.
   */
   async sendOtpEmail(email: string, otp: string): Promise<void> {
    try {
      const transporter: Transporter = nodemailer.createTransport({
        service: 'gmail', 
        auth: {
          user: process.env.EMAIL_USER, 
          pass: process.env.EMAIL_PASS, 
        },
      });

      const mailOptions: SendMailOptions = {
        from: process.env.EMAIL_USER, 
        to: email, 
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}. It will expire in 30 seconds.`,
        html: `<h3>Verify Your Email Using this OTP: </h3><p>Your OTP code is <strong>${otp}</strong>. It will expire in 30 seconds.</p>`,
      };

      await transporter.sendMail(mailOptions);
      console.log(`OTP sent to ${email}`);
    } catch (error) {
      console.error('Error while sending OTP email:', error);
      throw new CustomError('Failed to send OTP email', HttpStatusCodes.INTERNAL_SERVER_ERROR); 
    }
  }
  /**
   * Verifies the OTP provided by the user.
   * 
   * @param email - The email address for which OTP is being verified.
   * @param otp - The OTP provided by the user.
   * @returns A boolean indicating whether the OTP is valid and not expired.
   * @throws Error if the verification process fails.
   */
  async verifyOtp(email: string, otp: string): Promise<boolean> {
    try {
      const storedOtp: IOtp | null = await this.otpRepository.findOtpByEmail(email);
      if (!storedOtp) {
        return false; 
      }
      const isExpired: boolean = storedOtp.expiresAt < new Date(); 
      return storedOtp.otp === otp && !isExpired; 
    } catch (error) {
      console.error('Error in OtpService while verifying OTP:', error);
      throw new CustomError('Failed to verify OTP in the service layer', HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
  
}
