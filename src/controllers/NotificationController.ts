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
}