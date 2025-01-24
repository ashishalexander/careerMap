import { Request, Response, NextFunction } from "express";
import {  IUserCreate } from "../models/userModel";
import jwt from "jsonwebtoken";
import { IUserService } from "../services/interfaces/IUserService";
import { IOtpService } from "../services/interfaces/IOtpService";
import { CustomError } from "../errors/customErrors";
import { HttpStatusCodes } from '../config/HttpStatusCodes'; 
import { COOKIE_OPTIONS } from "../config/cookieConfig";
import { generateAccessToken,generateRefreshToken } from "../utils/tokenUtils";

interface DecodedToken {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  mobile: string;
  password: string;
}

export class UserController {
  constructor(
    private userService: IUserService,
    private otpService: IOtpService
  ) {}
  /**
   * Registers a new user by validating the provided data, generating a JWT token,
   * and initiating the OTP verification process.
   *
   * @param req - Express request object containing user registration details.
   * @param res - Express response object used to send responses to the client.
   * @returns JSON response indicating the result of the signup process.
   */
  async signup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    const { firstName, lastName, email, role, mobile, password } = req.body;
    if (!firstName || !lastName || !email || !role || !mobile || !password) {
      return next(new CustomError("All fields are required", HttpStatusCodes.BAD_REQUEST));

    }

    try {
      const existingUser = await this.userService.findUserByEmail(email);
      if (existingUser) {
        return next(new CustomError("Email already exists", HttpStatusCodes.BAD_REQUEST));

      }
      const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
      const token = jwt.sign(
        { firstName, lastName, email, role, mobile, password },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
      await this.otpService.createOtpEntry(email);
      return res
        .status(HttpStatusCodes.OK)
        .json({ message: "OTP sent for verification", token });
    } catch (error) {
      console.log(error)
      return next(new CustomError("An error occurred during registration", 500));

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
  async verifyOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    const { otpCode } = req.body;
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return next(new CustomError("Access token required", HttpStatusCodes.UNAUTHORIZED));

    }
    try{
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your_jwt_secret_key"
      ) as DecodedToken;
      console.log(decoded)
      const { email } = decoded;
      const isVerified = await this.otpService.verifyOtp(email, otpCode);
      if (!isVerified) {
        return next(new CustomError("Invalid or expired OTP", HttpStatusCodes.BAD_REQUEST));

      }
      const newUser: IUserCreate = { ...decoded };
      const registeredUser = await this.userService.completeSignup(newUser);
      return res
        .status(HttpStatusCodes.CREATED)
        .json({
          message: "User registered successfully",
          user: registeredUser,
        });
    } catch (error) {
      console.log(error)
      return next(new CustomError("Failed to verify OTP", HttpStatusCodes.INTERNAL_SERVER_ERROR));
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
  async resendOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      // const error = new Error("Access token required");
      // (error as any).statusCode = 401;
      return next(new CustomError("Access token required", HttpStatusCodes.UNAUTHORIZED));
    }
    try{
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your_jwt_secret_key"
      ) as DecodedToken;
      const { email } = decoded;
      await this.otpService.createOtpEntry(email);
      return res.status(HttpStatusCodes.OK).json({ message: "OTP resent successfully" });
    } catch (error) {
      console.log(error)
      return next(new CustomError("Failed to resend OTP", HttpStatusCodes.INTERNAL_SERVER_ERROR));

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
  async saveUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> { 
    const { name, email, image } = req.body.user;
    console.log(req.body)
    if (!name || !email || !image) {
      return next(new CustomError("Missing required fields",  HttpStatusCodes.BAD_REQUEST));
    }

    try {
      const existingUser = await this.userService.findUserByEmail(email);
      if(existingUser?.isblocked){
        return next( new CustomError("user is blocked by the admin",HttpStatusCodes.USER_BLOCKED))
      }
      if(existingUser){
        const accessToken = generateAccessToken(existingUser)
        const refreshToken = generateRefreshToken(existingUser)
        res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
        return res.status(200).json({ message: "Account already exists",accessToken,user:existingUser });
      } else {
        const array = name.split(" ");
        const firstName = array[0];
        const lastName = array[1] || "";

        const newUser = {
          firstName,
          lastName,
          email,
          profile: image,
        };

        const user = await this.userService.OauthCreateUser(newUser);
        if(user){
          const accessToken = generateAccessToken(user)
          const refreshToken = generateRefreshToken(user)
          res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
          return res
          .status(HttpStatusCodes.CREATED)
          .json({ message: "User created successfully",accessToken, user });
      }
        }
        
    } catch (error) {
      console.error("Error in saving user:", error);
      return next(new CustomError("An error occurred while saving the user",  HttpStatusCodes.INTERNAL_SERVER_ERROR));
    }
  }
}
