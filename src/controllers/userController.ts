import { Request, Response, NextFunction } from "express";
import { IUser, IUserCreate } from "../models/userModel";
import jwt from "jsonwebtoken";
import { IUserService } from "../services/interfaces/IUserService";
import { IOtpService } from "../services/interfaces/IOtpService";
import { CustomError } from "../errors/customErrors";


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
      return next(new CustomError("All fields are required", 400));

    }

    try {
      const existingUser = await this.userService.findUserByEmail(email);
      if (existingUser) {
        return next(new CustomError("Email already exists", 400));

      }
      const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
      const token = jwt.sign(
        { firstName, lastName, email, role, mobile, password },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      await this.otpService.createOtpEntry(email);
      return res
        .status(200)
        .json({ message: "OTP sent for verification", token });
    } catch (error) {
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
      return next(new CustomError("Access token required", 401));

    }
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your_jwt_secret_key"
      ) as DecodedToken;
      const { email } = decoded;
      const isVerified = await this.otpService.verifyOtp(email, otpCode);
      if (!isVerified) {
        return next(new CustomError("Invalid or expired OTP", 400));

      }
      const newUser: IUserCreate = { ...decoded };
      const registeredUser = await this.userService.completeSignup(newUser);
      return res
        .status(201)
        .json({
          message: "User registered successfully",
          user: registeredUser,
        });
    } catch (error) {
      return next(new CustomError("Failed to verify OTP", 500));
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
      const error = new Error("Access token required");
      (error as any).statusCode = 401;
      return next(new CustomError("Access token required", 401));
    }
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your_jwt_secret_key"
      ) as DecodedToken;
      const { email } = decoded;
      await this.otpService.createOtpEntry(email);
      return res.status(200).json({ message: "OTP resent successfully" });
    } catch (error) {
      return next(new CustomError("Failed to resend OTP", 500));

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
    const { name, email, image } = req.body;
    if (!name || !email || !image) {
      return next(new CustomError("Missing required fields", 400));

    }

    try {
      const existingUser = await this.userService.findUserByEmail(email);

      if (existingUser) {
        return res.status(200).json({ message: "Account already exists" });
      } else {
        const array = name.split(" ");
        const firstName = array[0];
        const lastName = array[1] || "";

        const newUser = {
          firstName,
          lastName,
          email,
          profilePicture: image,
        };

        const user = await this.userService.OauthCreateUser(newUser);

        return res
          .status(201)
          .json({ message: "User created successfully", user });
      }
    } catch (error) {
      console.error("Error in saving user:", error);
      return next(new CustomError("An error occurred while saving the user", 500));
    }
  }
}
