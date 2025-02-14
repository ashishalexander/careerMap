import { Request, Response, NextFunction } from "express";

export interface IAuthController {
    signIn(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    resetPassword(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    refreshToken(req: Request, res: Response, next: NextFunction): void;
    logout(req: Request, res: Response, next: NextFunction): Promise<Response>;
}
