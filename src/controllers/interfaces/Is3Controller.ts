import { Request, Response, NextFunction } from "express";

export interface IS3Controller {
    uploadProfilePicture(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    deleteProfilePicture(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    uploadBannerImage(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}