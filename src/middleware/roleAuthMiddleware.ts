
import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../errors/customErrors';
import { HttpStatusCodes } from '../config/HttpStatusCodes';
import { IAuthTokenPayload } from '../interfaces/authTokenPayload';

interface CustomRequest extends Request {
    user?: IAuthTokenPayload;
}

export const roleAuth = (allowedRoles: string[]) => {
    return (req: CustomRequest, res: Response, next: NextFunction) => {
        try {
            // We can now use the user data from req.user since it's set by authMiddleware
            const userRole = req.user?.role;

            if (!userRole) {
                throw new CustomError('Role not found in user data', HttpStatusCodes.UNAUTHORIZED);
            }

            if (!allowedRoles.includes(userRole)) {
                throw new CustomError(
                    'You do not have permission to access this resource',
                    HttpStatusCodes.ROLE_NOT_FOUND
                );
            }

            next();
        } catch (error) {
            if (error instanceof CustomError) {
                next(error);
            } else {
                next(new CustomError('Authorization failed', HttpStatusCodes.UNAUTHORIZED));
            }
        }
    };
};
