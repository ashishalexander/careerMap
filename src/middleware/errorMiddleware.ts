import { Request, Response, NextFunction } from 'express';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);

    if (err.status) {
        return res.status(err.status).json({
            success: false,
            message: err.message || 'An error occurred',
        });
    }

    return res.status(500).json({
        success: false,
        message: 'Internal Server Error',
    });
};