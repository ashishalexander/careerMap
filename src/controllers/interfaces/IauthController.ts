import { Request, Response, NextFunction } from "express";

export interface IAuthController {
    signIn(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    resetPassword(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    logout(req: Request, res: Response, next: NextFunction):void;
}
