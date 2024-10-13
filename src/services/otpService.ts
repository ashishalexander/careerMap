import { OtpRepository } from '../repositories/otpRepository';
import { IOtp } from '../models/otpModel';
import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export class OtpService {
  constructor(private otpRepository: OtpRepository) {}

  // Method to create an OTP entry
  async createOtpEntry(email: string): Promise<void> {
    try {
      const otp: string = Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt: Date = new Date(Date.now() + 30 * 1000); // Set expiry for 30 seconds

      await this.otpRepository.createOtpEntry(email, otp, expiresAt);
      console.log(`OTP for ${email}: ${otp}`);
      await this.sendOtpEmail(email, otp);

    } catch (error) {
      console.error('Error in OtpService while creating OTP:', error);
      throw new Error('Failed to create OTP entry in the service layer'); // Propagate the error to the controller
    }
  }

  // Method to send OTP via email
  private async sendOtpEmail(email: string, otp: string): Promise<void> {
    try {
      // Create transporter for sending email
      const transporter: Transporter = nodemailer.createTransport({
        service: 'gmail', // Ensure the casing is correct
        auth: {
          user: process.env.EMAIL_USER, // Your email address
          pass: process.env.EMAIL_PASS, // Your email password or app password
        },
      });

      // Mail options
      const mailOptions: SendMailOptions = {
        from: process.env.EMAIL_USER, // Sender address
        to: email, // Recipient email address
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}. It will expire in 30 seconds.`,
        html: `<h3>Verify Your Email Using this OTP: </h3><p>Your OTP code is <strong>${otp}</strong>. It will expire in 30 seconds.</p>`,
      };

      // Send email
      await transporter.sendMail(mailOptions);
      console.log(`OTP sent to ${email}`);
    } catch (error) {
      console.error('Error while sending OTP email:', error);
      throw new Error('Failed to send OTP email');
    }
  }

  // Method to verify the OTP
  async verifyOtp(email: string, otp: string): Promise<boolean> {
    try {
      const storedOtp: IOtp | null = await this.otpRepository.findOtpByEmail(email);
      if (!storedOtp) {
        return false; // No OTP entry found
      }
      const isExpired: boolean = storedOtp.expiresAt < new Date(); // Check if the OTP has expired
      return storedOtp.otp === otp && !isExpired; // Check if stored OTP matches the provided OTP and is not expired
    } catch (error) {
      console.error('Error in OtpService while verifying OTP:', error);
      throw new Error('Failed to verify OTP in the service layer'); // Propagate the error to the controller
    }
  }
  
}
