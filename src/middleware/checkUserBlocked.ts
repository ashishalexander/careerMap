// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';
// import {UserModel} from '../models/userModel'


// export const checkUserBlocked = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//         const token = req.headers.authorization?.split(' ')[1];

//         if (!token) {
//             res.status(401).json({ message: "Authorization token missing." });
//             return;
//         }  

//         const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any ;
//         console.log(decoded)
//         // Fetch user from the database
//         const user = await UserModel.findById(decoded.userId);

//         if (!user) {
//             res.status(404).json({ message: "User not found." });
//             return;
//         }

//         // Check if user is blocked
//         if (user.isblocked) {
//             res.status(450).json({ message: "Your account has been blocked by the admin." });
//             return;
//         }

//         next();
//     } catch (error) {
//         console.error(error);
//         res.status(401).json({ message: "Unauthorized or invalid token." });
//     }
// };


// checkUserBlocked.ts
import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/userModel';
import { CustomError } from '../errors/customErrors';

interface CustomRequest extends Request {
  user?: any; // Replace 'any' with your actual user type
}

export const checkUserBlocked = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        // We can now use the user data from req.user since it's set by authMiddleware
        const userId = req.user?.userId;

        if (!userId) {
            throw new CustomError('User ID not found in request', 401);
        }

        // Fetch user from the database
        const user = await UserModel.findById(userId);

        if (!user) {
            throw new CustomError('User not found', 404);
        }

        // Check if user is blocked
        if (user.isblocked) {
            throw new CustomError('Your account has been blocked by the admin', 450);
        }

        next();
    } catch (error) {
        if (error instanceof CustomError) {
            next(error);
        } else {
            next(new CustomError('Authentication failed', 401));
        }
    }
};
