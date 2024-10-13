import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { ForgotPasswordService } from '../services/userfrgpaService';
import { UserRepository } from '../repositories/userRepository';

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

    async signIn(req: Request, res: Response): Promise<Response> {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        try {
            const signIntoken = await this.authService.signIn(email, password);
            return res.status(200).json({
                success: true,
                data: { signIntoken }
            });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(401).json({
                    success: false,
                    message: error.message
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Internal Server Error'
            });
        }
    }

    async requestPasswordReset(req: Request, res: Response): Promise<Response> {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }
        try {
            await this.forgotPasswordService.sendResetEmail(email);
            return res.status(200).json({
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent.'
            });
        } catch (error) {
            console.error('Password reset error:', error);
            return res.status(500).json({
                success: false,
                message: 'Unable to process password reset request'
            });
        }
    }

    async resetPassword(req: Request, res: Response): Promise<Response> {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Token and new password are required'
            });
        }
        try {
            await this.forgotPasswordService.resetPassword(token, newPassword);
            return res.status(200).json({
                success: true,
                message: 'Password has been successfully reset'
            });
        } catch (error) {
            if (error instanceof Error && error.message === 'Invalid or expired reset token') {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Unable to reset password'
            });
        }
    }
}