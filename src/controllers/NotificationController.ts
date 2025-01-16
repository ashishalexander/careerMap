import { Request, Response, NextFunction } from 'express';
import { INotificationService } from '../services/interfaces/INotificationService';
import { CustomError } from '../errors/customErrors';
import { HttpStatusCodes } from '../config/HttpStatusCodes';

export class NotificationController {
  private notificationService: INotificationService;

  constructor(notificationService: INotificationService) {
    this.notificationService = notificationService;
  }

  async createNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notification = await this.notificationService.createNotification(req.body);
      res.status(HttpStatusCodes.CREATED).json({
        message: 'Notification created successfully',
        data: notification,
      });
    } catch (error: any) {
      next(new CustomError(error.message, error.status || HttpStatusCodes.INTERNAL_SERVER_ERROR));
    }
  }

  async getAllNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notifications = await this.notificationService.getAllNotifications();
      res.status(HttpStatusCodes.OK).json({ data: notifications });
    } catch (error: any) {
      next(new CustomError(error.message, error.status || HttpStatusCodes.INTERNAL_SERVER_ERROR));
    }
  }

  async getUserNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {userId} = req.params; // Assuming you have user info in the request from auth middleware
      if (!userId) {
        throw new CustomError('User not authenticated', HttpStatusCodes.UNAUTHORIZED);
      }
  
      const userNotifications = await this.notificationService.getUserNotifications(userId);
      console.log(userNotifications)
      res.status(HttpStatusCodes.OK).json({data:userNotifications});
    } catch (error: any) {
      next(new CustomError(error.message, error.status || HttpStatusCodes.INTERNAL_SERVER_ERROR));
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
  
      if (!id) {
        throw new CustomError('User ID is required', HttpStatusCodes.BAD_REQUEST);
      }
  
      const user = await this.notificationService.getUserById(id);
        
      if (!user) {
        throw new CustomError('User not found', HttpStatusCodes.NOT_FOUND);
      }
  
      res.status(HttpStatusCodes.OK).json({data:user});
    } catch (error: any) {
      next(new CustomError(error.message, error.status || HttpStatusCodes.INTERNAL_SERVER_ERROR));
    }
  }
}