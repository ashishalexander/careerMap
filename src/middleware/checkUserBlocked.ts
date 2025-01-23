import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {UserModel} from '../models/userModel'


export const checkUserBlocked = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            res.status(401).json({ message: "Authorization token missing." });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any ;
        // Fetch user from the database
        const user = await UserModel.findById(decoded.userId);

        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }

        // Check if user is blocked
        if (user.isblocked) {
            res.status(450).json({ message: "Your account has been blocked by the admin." });
            return;
        }

        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: "Unauthorized or invalid token." });
    }
};
