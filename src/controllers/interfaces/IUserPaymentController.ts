import { Request, Response, NextFunction } from "express";

export interface IUserPaymentController {
  createOrder(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

  verifyPayment(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
