import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { OtpService } from '../services/otpService';
import { IUser,IUserCreate } from '../models/userModel';
import jwt from 'jsonwebtoken';


interface DecodedToken {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  mobile: string;
  password: string; 
}

export class UserController {
  constructor(private userService: UserService, private otpService: OtpService) {}
  /**
   * Registers a new user by validating the provided data, generating a JWT token, 
   * and initiating the OTP verification process.
   * 
   * @param req - Express request object containing user registration details.
   * @param res - Express response object used to send responses to the client.
   * @returns JSON response indicating the result of the signup process.
   */
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
      const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
       const token = jwt.sign(
        { firstName, lastName, email, role, mobile,password }, 
        JWT_SECRET,                                   
        { expiresIn: '1h' }                           
      );


      await this.otpService.createOtpEntry(email);
      return res.status(200).json({ message: 'OTP sent for verification',token });
    } catch (error) {
      return res.status(500).json({ error: 'An error occurred during registration' });
    }
  }
  /**
   * Verifies the OTP sent to the user's email. Upon successful verification, the user's
   * registration is completed and stored in the database.
   * 
   * @param req - Express request object containing the OTP code and JWT token.
   * @param res - Express response object used to send responses to the client.
   * @returns JSON response indicating the result of OTP verification and user registration.
   */
  async verifyOtp(req: Request, res: Response): Promise<Response> {
    const { otpCode } = req.body; 
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key') as DecodedToken;
      const {firstName, lastName,email, role, mobile, password } = decoded;
      const isVerified = await this.otpService.verifyOtp(email, otpCode);
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
  /**
   * Resends the OTP to the user's email for verification. This can be used in cases
   * where the user did not receive the original OTP or the OTP expired.
   * 
   * @param req - Express request object containing the JWT token in the headers.
   * @param res - Express response object used to send responses to the client.
   * @returns JSON response confirming the OTP was resent.
   */
  async resendOtp(req: Request, res: Response): Promise<Response> {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key') as DecodedToken;
      const {email} = decoded;
      await this.otpService.createOtpEntry(email);
      return res.status(200).json({ message: 'OTP resent successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to resend OTP' });
    }
  }
  /**
   * Saves or registers a user who has authenticated via a third-party OAuth provider
   * (such as Google, Facebook, etc.). If the user already exists, the account will not be duplicated.
   * 
   * @param req - Express request object containing user details from the OAuth provider.
   * @param res - Express response object used to send responses to the client.
   * @returns JSON response with success message or appropriate error message.
   */
  async saveUser(req: Request, res: Response): Promise<Response | any> {
    const { name, email, image } = req.body;  
    if (!name || !email || !image) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
  
    try {
      const existingUser = await this.userService.findUserByEmail(email);
  
      if (existingUser) {
        return res.status(200).json({ message: 'Account already exists' });
      } else {
        const array = name.split(' ');
        const firstName = array[0];
        const lastName = array[1] || ''; 
  
        const newUser = {
          firstName,
          lastName,
          email,
          profilePicture: image,
        };
  
        const user = await this.userService.Oauthcreateuser(newUser);
  
        return res.status(201).json({ message: 'User created successfully', user });
      }
    } catch (error) {
      console.error('Error in saving user:', error);
      return res.status(500).json({ message: 'An error occurred while saving the user' });
   }
  }
}
