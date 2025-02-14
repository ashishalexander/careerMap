import { Request, Response, NextFunction } from "express";

export interface IUserProfileController {
  updateProfile(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
  updateAbout(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
  AddEducation(req: Request, res: Response, next: NextFunction): Promise<Response | void> ;
  updateEducation(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
  deleteEducation(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
  updateExperience(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
  addExperience(req: Request, res: Response, next: NextFunction): Promise<Response | void> ;
  deleteExperience(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
  fetchActivity(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
  recruiterJobPosts(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
  getUserProfile(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}