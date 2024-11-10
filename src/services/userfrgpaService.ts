import { UserRepository } from "../repositories/userRepository";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { Types } from 'mongoose';
import { IUser } from '../models/userModel'; 
import bcrypt from 'bcryptjs';
import { CustomError } from '../errors/customErrors'; 
import { IUserRepository } from "../repositories/interfaces/userRepository";
import { IForgetPasswordService } from "./interfaces/IForgetPasswordService";
import { HttpStatusCodes } from '../config/HttpStatusCodes';

interface ResetTokenPayload {
    userId: string;
    email: string;
}

export class ForgotPasswordService implements IForgetPasswordService {
    private readonly SALT_ROUNDS = 10;

    constructor(private readonly userRepository: IUserRepository) {}

    /**
     * Sends a password reset email to the user.
     * 
     * @param email - The email address of the user requesting a password reset.
     */
    async sendResetEmail(email: string): Promise<void> {
        const user = await this.userRepository.findUserByEmail(email);
        
        // Silent fail for security reasons
        if (!user) throw new CustomError('User not found', HttpStatusCodes.NOT_FOUND); 

        const resetToken = this.generateResetToken(user._id.toString(), email);
        const resetLink = this.generateResetLink(resetToken);
        
        await this.sendEmail(email, resetLink);
    }
    /**
     * Resets the user's password using the provided token.
     * 
     * @param token - The password reset token.
     * @param newPassword - The new password to be set.
     */
    async resetPassword(token: string, newPassword: string): Promise<void> {
        try {
            const { userId } = await this.verifyResetToken(token);
            
            // Hash the new password
            const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
            
            // Update the user's password
            await this.userRepository.updateUserPassword(userId, hashedPassword);
        } catch (error) {
            throw new CustomError('Failed to reset password',  HttpStatusCodes.INTERNAL_SERVER_ERROR); 
        }
    }
    /**
     * Generates a JWT-based reset token.
     * 
     * @param userId - The user's unique ID.
     * @param email - The user's email address.
     * @returns A JWT reset token with userId and email.
     */
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
     /**
     * Generates a reset link for the frontend.
     * 
     * @param token - The password reset token.
     * @returns The URL that the user can use to reset their password.
     */
    private generateResetLink(token: string): string {
        const baseUrl = process.env.FRONTEND_URL as string;
        return `${baseUrl}/user/resetPassword?token=${token}`;
    }
    /**
     * Sends the password reset email.
     * 
     * @param to - The recipient's email address.
     * @param resetLink - The password reset link to be included in the email.
     * @throws Error if email sending fails.
     */
    private async sendEmail(to: string, resetLink: string): Promise<void> {
        const transporter = nodemailer.createTransport({
            service: 'gmail', 
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS  
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER, 
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
            throw new CustomError(`Failed to send password reset email: ${errorMessage}`, HttpStatusCodes.INTERNAL_SERVER_ERROR); 
        }
    }
     /**
     * Verifies the JWT reset token.
     * 
     * @param token - The password reset token to verify.
     * @returns Decoded token containing userId and email.
     * @throws Error if the token is invalid or expired.
     */
    async verifyResetToken(token: string): Promise<{ userId: Types.ObjectId, email: string }> {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as ResetTokenPayload;
            return {
                userId: new Types.ObjectId(decoded.userId),
                email: decoded.email
            };
        } catch (error) {
            throw new CustomError('Invalid or expired reset token', HttpStatusCodes.BAD_REQUEST); 
        }
    }
}
