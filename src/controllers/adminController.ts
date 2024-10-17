import { Request, Response, NextFunction } from 'express';
import {AdminService} from '../services/adminService';
import { CustomError } from '../errors/customErrors';
import jwt from 'jsonwebtoken'
import { IAuthTokenPayload } from '../interfaces/authTokenPayload';
import { generateAccessToken } from '../utils/tokenUtils';
import { IUser } from '../models/userModel';

export class AdminController {
    constructor(private adminService: AdminService) {}

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { email, password } = req.body;

        try {
            const { admin, accessToken, refreshToken } = await this.adminService.authenticate(email, password);
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true, // Prevents JavaScript from accessing the cookie
                secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
                sameSite: 'lax', // Helps protect against CSRF attacks
                maxAge: 7 * 24 * 60 * 60 * 1000 // Cookie expiration: 7 days
            });
            res.status(200).json({
                admin,accessToken,
                message: 'Login successful'
            });
        } catch (error) {
            next(error);
        }
    }

    public refreshToken = (req: Request, res: Response, next: NextFunction) => {
        const refreshToken = req.body.token; // Ensure token is obtained from a secure source (e.g., HttpOnly cookie)
        if (!refreshToken) {
            return next(new CustomError('Refresh token is required', 401)); // Use CustomError for missing token
        }

        const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
        if (!jwtRefreshSecret) {
            return next(new CustomError('JWT_REFRESH_SECRET is not defined in the environment variables', 500)); // Use CustomError for missing secret
        }

        jwt.verify(refreshToken, jwtRefreshSecret, (err: Error | null, decoded: unknown) => {
            if (err || !decoded) {
                return next(new CustomError('Invalid refresh token', 403)); // Use CustomError for invalid token
            }

        const payload = decoded as IAuthTokenPayload;

        const accessToken = generateAccessToken({ _id: payload._id, email: payload.email, role: payload.role });
        res.json({ accessToken });
        });
    };

    public async fetchUsers(req: Request, res: Response, next: NextFunction): Promise<Response|void> {
        try {
            const users = await this.adminService.fetchAllUsers();
            return res.status(200).json({users});
        } catch (error) {
            next(error);
        }
    }
}

