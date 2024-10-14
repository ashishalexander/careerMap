import { OtpRepository } from '../repositories/otpRepository';
import { IOtp } from '../models/otpModel';
import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export class OtpService {
  constructor(private otpRepository: OtpRepository) {}
  /**
   * Generates and stores an OTP for the given email, and sends it via email.
   * 
   * @param email - The email address for which OTP is generated.
   * @throws Error if the OTP creation or email sending process fails.
   */
  async createOtpEntry(email: string): Promise<void> {
    try {
      const otp: string = Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt: Date = new Date(Date.now() + 30 * 1000); // Set expiry for 30 seconds

      await this.otpRepository.createOtpEntry(email, otp, expiresAt);
      console.log(`OTP for ${email}: ${otp}`);
      await this.sendOtpEmail(email, otp);

    } catch (error) {
      console.error('Error in OtpService while creating OTP:', error);
      throw new Error('Failed to create OTP entry in the service layer'); 
    }
  }

  /**
   * Sends the OTP via email using nodemailer.
   * 
   * @param email - The recipient email address.
   * @param otp - The OTP to be sent.
   * @throws Error if email sending fails.
   */
  private async sendOtpEmail(email: string, otp: string): Promise<void> {
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
      throw new Error('Failed to send OTP email');
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
