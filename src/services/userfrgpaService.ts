import { UserRepository } from "../repositories/userRepository";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { Types } from 'mongoose';
import { IUser } from '../models/userModel'; 
import bcrypt from 'bcryptjs';

interface ResetTokenPayload {
    userId: string;
    email: string;
}

export class ForgotPasswordService {
    private readonly userRepository: UserRepository;
    private readonly SALT_ROUNDS = 10;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    async sendResetEmail(email: string): Promise<void> {
        const user = await this.userRepository.findUserByEmail(email);
        
        // Silent fail for security reasons
        if (!user) return;

        const resetToken = this.generateResetToken(user._id.toString(), email);
        const resetLink = this.generateResetLink(resetToken);
        
        await this.sendEmail(email, resetLink);
    }

    async resetPassword(token: string, newPassword: string): Promise<void> {
        try {
            const { userId } = await this.verifyResetToken(token);
            
            // Hash the new password
            const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
            
            // Update the user's password
            await this.userRepository.updateUserPassword(userId, hashedPassword);
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to reset password');
        }
    }

    private generateResetToken(userId: string, email: string): string {
        const payload: ResetTokenPayload = {
            userId,
            email
        };
        
        return jwt.sign(
            payload,
            process.env.JWT_SECRET as string,
            { expiresIn: "1h" }
        );
    }

    private generateResetLink(token: string): string {
        const baseUrl = process.env.FRONTEND_URL as string;
        return `${baseUrl}/user/resetPassword?token=${token}`;
    }

    private async sendEmail(to: string, resetLink: string): Promise<void> {
        // Create transporter inside the sendEmail function
        const transporter = nodemailer.createTransport({
            service: 'gmail', // or any other service like 'SendGrid', 'Mailgun', etc.
            auth: {
                user: process.env.EMAIL_USER, // Your email address
                pass: process.env.EMAIL_PASS  // Your email password or app-specific password
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER, // Sender address
            to,
            subject: "Password Reset Request",
            text: `Click here to reset your password: ${resetLink}`,
            html: `
                <h1>Password Reset Request</h1>
                <p>Click the link below to reset your password:</p>
                <a href="${resetLink}">Reset Password</a>
                <p>If you didn't request this, please ignore this email.</p>
                <p>This link will expire in 1 hour.</p>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            throw new Error(`Failed to send password reset email: ${errorMessage}`);
        }
    }

    async verifyResetToken(token: string): Promise<{ userId: Types.ObjectId, email: string }> {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as ResetTokenPayload;
            return {
                userId: new Types.ObjectId(decoded.userId),
                email: decoded.email
            };
        } catch (error) {
            throw new Error('Invalid or expired reset token');
        }
    }
}
