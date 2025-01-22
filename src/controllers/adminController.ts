import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../errors/customErrors';
import jwt from 'jsonwebtoken'
import { IAuthTokenPayload } from '../interfaces/authTokenPayload';
import { generateAccessToken } from '../utils/tokenUtils';
import { IAdminService } from '../services/interfaces/IAdminService';
import {COOKIE_OPTIONS} from '../config/cookieConfig'
import { HttpStatusCodes } from '../config/HttpStatusCodes'; 
import { QueryParams } from '../interfaces/listingPage';



export class AdminController{
    constructor(private adminService: IAdminService) {}

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { email, password } = req.body;

        try {
            const { admin, accessToken, refreshToken } = await this.adminService.authenticate(email, password);
            res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
            res.status(HttpStatusCodes.OK).json({
                admin,accessToken,
                message: 'Login successful'
            });
        } catch (error) {
            next(error);
        }
    }

    public refreshToken = (req: Request, res: Response, next: NextFunction) => {
        const refreshToken = req.cookies.refreshToken; // Ensure token is obtained from a secure source (e.g., HttpOnly cookie)
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
        res.status(HttpStatusCodes.OK).json({ accessToken });
        });
    };

    public async fetchUsers(req: Request, res: Response, next: NextFunction): Promise<Response|void> {
        try {
          const queryParams: QueryParams = {
            page: parseInt(req.query.page as string) || 1,
            limit: parseInt(req.query.limit as string) || 10,
            search: req.query.search as string,
            sortBy: req.query.sortBy as string || 'firstName',
            sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc'
          };
    
          const result = await this.adminService.fetchAllUsers(queryParams);
          console.log(result)
          return res.status(HttpStatusCodes.OK).json({message:"Fetched data successfully",data: result});
        } catch (error) {
          next(error);
        }
      }

    public async blockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { userId } = req.params;
        try {
            await this.adminService.blockUser(userId);
            res.status(HttpStatusCodes.OK).json({ message: 'User blocked successfully' });
        } catch (error) {
            next(error);
        }
    }
}

