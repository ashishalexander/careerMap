import { Request, Response,NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { ForgotPasswordService } from '../services/userfrgpaService';
import { UserRepository } from '../repositories/userRepository';
import { CustomError } from '../errors/customErrors';
/**
 * Controller for handling authentication and password reset requests
 */
export class AuthController {
    private readonly authService: AuthService;
    private readonly forgotPasswordService: ForgotPasswordService;

    constructor(
        userRepository: UserRepository,
    ) {
        this.authService = new AuthService();
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
            const signIntoken = await this.authService.signIn(email, password);
            return res.status(200).json({
                success: true,
                data: { signIntoken }
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
            return next(new CustomError('Email is required', 400)); 

        }
        try {
            await this.forgotPasswordService.sendResetEmail(email);
            return res.status(200).json({
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
            return next(new CustomError('Token and new password are required', 400)); // Bad Request

        }
        try {
            await this.forgotPasswordService.resetPassword(token, newPassword);
            return res.status(200).json({
                success: true,
                message: 'Password has been successfully reset'
            });
        } catch (error:any) {
            if (error.message === 'Invalid or expired reset token') {
                return next(new CustomError(error.message, 400)); // Bad Request
            }
            return next(new CustomError('Unable to reset password', 500)); // Internal Server Error

        }
    }
}