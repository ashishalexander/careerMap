import { Request, Response, NextFunction } from "express";

export interface IUserController {
    signup(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    verifyOtp(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    resendOtp(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    saveUser(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    getSubscriptionDetails(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
  }