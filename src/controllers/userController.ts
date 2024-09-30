// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { OtpService } from '../services/otpService';
import { IUser } from '../models/userModel';

export class UserController {
  constructor(private userService: UserService, private otpService: OtpService) {}

  // Method for signing up (not static)
  async signup(req: Request, res: Response): Promise<Response> {
    const { firstName, lastName, email, role, mobile, password } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !role || !mobile || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    try {
      // Check if email already exists in the user collection
      const existingUser = await this.userService.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      // Store the email in the OTP collection and send OTP
      await this.otpService.createOtpEntry(email);
      return res.status(200).json({ message: 'OTP sent for verification' });
    } catch (error) {
      return res.status(500).json({ error: 'An error occurred during registration' });
    }
  }

  // Method for verifying OTP (not static)
  async verifyOtp(req: Request, res: Response): Promise<Response> {
    const { firstName, lastName, email, role, mobile, password, otp } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !role || !mobile || !password || !otp) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    try {
      // Verify OTP
      const isVerified = await this.otpService.verifyOtp(email, otp);
      if (!isVerified) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

       // Create user object to match IUser type but exclude _id
       const newUser = {
        firstName,
        lastName,
        email,
        role,
        mobile,
        password,
      };

      // After successful OTP verification, complete the user registration
      const registeredUser = await this.userService.completeSignup(newUser);

      return res.status(201).json({ message: 'User registered successfully', user: registeredUser });
    } catch (error) {
      return res.status(500).json({ error: 'OTP verification failed' });
    }
  }
}
