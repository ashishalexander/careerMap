import { Request, Response, NextFunction } from "express";

export interface IUserNetworkController {
  getPendingRequests(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

  getSuggestions(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

  connect(req: Request, res: Response, next: NextFunction): Promise<Response | void>;

  handleRequest(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
