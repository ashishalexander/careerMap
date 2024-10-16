import { Request, Response, NextFunction } from 'express';
import {AdminService} from '../services/adminService';

export class AdminController {
    constructor(private adminService: AdminService) {}

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { email, password } = req.body;

        try {
            const { admin, token } = await this.adminService.authenticate(email, password);
            res.status(200).json({
                admin,token,
                message: 'Login successful'
            });
        } catch (error) {
            next(error);
        }
    }
}

