import { Request, Response,NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { ForgotPasswordService } from '../services/userfrgpaService';
import { UserRepository } from '../repositories/userRepository';
import { CustomError } from '../errors/customErrors';
import { generateAccessToken } from '../utils/tokenUtils';
import jwt from 'jsonwebtoken'
import { IAuthTokenPayload } from '../interfaces/authTokenPayload';
import { IAuthService } from '../services/interfaces/IAuthService';
import { IForgetPasswordService } from '../services/interfaces/IForgetPasswordService';
import { IUserRepository } from '../repositories/interfaces/userRepository';
import {COOKIE_OPTIONS} from '../config/cookieConfig'
import { HttpStatusCodes } from '../config/HttpStatusCodes'; 


export class AuthController {
    private readonly authService: IAuthService;
    private readonly forgotPasswordService: IForgetPasswordService;

    constructor(
        userRepository: IUserRepository
    ) {
        this.authService = new AuthService(userRepository);
        this.forgotPasswordService = new ForgotPasswordService(
            userRepository,
        );
    }
    /**
     * Signs in a user with email and password.
     * @param {Request} req - Express request object containing the email and password.
     * @param {Response}res - Express response object to send the response.
     * @returns {Promise<Response>} - The response with the token or error message.
     */
    async signIn(req: Request, res: Response,next:NextFunction): Promise<Response|void> {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new CustomError('Email and password are required', 400)); 
        }
        try {
            const { accessToken, refreshToken } = await this.authService.signIn(email, password);
            res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
            return res.status(HttpStatusCodes.OK).json({
                success: true,
                data: { accessToken }
            });
        } catch (error) {
            return next(error)
        }
    }
    /**
     * Sends a password reset link to the user's email.
     * @param {Request} req - Express request object containing the user's email.
     * @param {Response} res - Express response object to send the response.
     * @returns {Promise<Response>} - The response indicating whether the reset email was sent.
     */
    async requestPasswordReset(req: Request, res: Response,next:NextFunction): Promise<Response|void> {
        const { email } = req.body;

        if (!email) {
            return next(new CustomError('Email is required', HttpStatusCodes.BAD_REQUEST)); 

        }
        try {
            await this.forgotPasswordService.sendResetEmail(email);
            return res.status(HttpStatusCodes.OK).json({
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent.'
            });
        } catch (error) {
            console.error('Password reset error:', error);
            return next(new CustomError('Unable to process password reset request', 500));

        }
    }
   /**
     * Resets the user's password using the provided token and new password.
     * @param {Request} req - Express request object containing the reset token and new password.
     * @param {Response} res - Express response object to send the response.
     * @returns {Promise<Response>} - The response indicating whether the password was successfully reset.
     */
    async resetPassword(req: Request, res: Response,next:NextFunction): Promise<Response|void> {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return next(new CustomError('Token and new password are required', HttpStatusCodes.BAD_REQUEST)); // Bad Request

        }
        try {
            await this.forgotPasswordService.resetPassword(token, newPassword);
            return res.status(HttpStatusCodes.OK).json({
                success: true,
                message: 'Password has been successfully reset'
            });
        } catch (error:any) {
            if (error.message === 'Invalid or expired reset token') {
                return next(new CustomError(error.message, HttpStatusCodes.BAD_REQUEST)); // Bad Request
            }
            return next(new CustomError('Unable to reset password',  HttpStatusCodes.INTERNAL_SERVER_ERROR)); // Internal Server Error

        }
    }

    public refreshToken = (req: Request, res: Response, next: NextFunction) => {
        const refreshToken = req.body.token; // Ensure token is obtained from a secure source (e.g., HttpOnly cookie)
        if (!refreshToken) {
            return next(new CustomError('Refresh token is required', HttpStatusCodes.UNAUTHORIZED)); // Use CustomError for missing token
        }

        const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
        if (!jwtRefreshSecret) {
            return next(new CustomError('JWT_REFRESH_SECRET is not defined in the environment variables', HttpStatusCodes.INTERNAL_SERVER_ERROR)); // Use CustomError for missing secret
        }

        jwt.verify(refreshToken, jwtRefreshSecret, (err: Error | null, decoded: unknown) => {
            if (err || !decoded) {
                return next(new CustomError('Invalid refresh token', HttpStatusCodes.FORBIDDEN)); // Use CustomError for invalid token
            }

        const payload = decoded as IAuthTokenPayload;

        const accessToken = generateAccessToken({ _id: payload._id, email: payload.email, role: payload.role });
        res.json({ accessToken });
        });
    };
}