import { Request, Response, NextFunction } from 'express';
import { IAdminService } from '../services/interfaces/IAdminService';
import {COOKIE_OPTIONS} from '../config/cookieConfig'
import { HttpStatusCodes } from '../config/HttpStatusCodes'; 
import { QueryParams } from '../interfaces/listingPage';
import { IAdminController } from './interfaces/IadminController';



export class AdminController implements IAdminController{
    constructor(private adminService: IAdminService) {}

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { email, password } = req.body;

        try {
            const { admin, accessToken, refreshToken } = await this.adminService.authenticate(email, password);
            res.cookie('adminrefreshToken', refreshToken, {...COOKIE_OPTIONS,path:"/api/admin"})
            res.status(HttpStatusCodes.OK).json({
                admin,accessToken,
                message: 'Login successful'
            });
        } catch (error) {
            next(error);
        }
    }

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

