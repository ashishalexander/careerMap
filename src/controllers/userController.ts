import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { OtpService } from '../services/otpService';
import { IUser,IUserCreate } from '../models/userModel';

export class UserController {
  constructor(private userService: UserService, private otpService: OtpService) {}

  async signup(req: Request, res: Response): Promise<Response> {
    const { firstName, lastName, email, role, mobile, password } = req.body;

    if (!firstName || !lastName || !email || !role || !mobile || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    try {
      const existingUser = await this.userService.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      await this.otpService.createOtpEntry(email);
      return res.status(200).json({ message: 'OTP sent for verification' });
    } catch (error) {
      return res.status(500).json({ error: 'An error occurred during registration' });
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<Response> {
    const { firstName, lastName, email, role, mobile, password, otp } = req.body;

    if (!firstName || !lastName || !email || !role || !mobile || !password || !otp) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    try {
      const isVerified = await this.otpService.verifyOtp(email, otp);
      if (!isVerified) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

       const newUser:IUserCreate = {
        firstName,
        lastName,
        email,
        role,
        mobile,
        password,
      };

      const registeredUser = await this.userService.completeSignup(newUser);

      return res.status(201).json({ message: 'User registered successfully', user: registeredUser });
    } catch (error) {
      return res.status(500).json({ error: 'OTP verification failed' });
    }
  }

  async resendOtp(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    try {
      await this.otpService.createOtpEntry(email);
      res.status(200).json({ message: 'OTP resent successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to resend OTP' });
    }
  }
}
