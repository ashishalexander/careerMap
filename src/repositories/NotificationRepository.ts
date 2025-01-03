import { INotificationRepository } from './interfaces/INotificationRepository';
import NotificationModel, { INotification } from '../models/NotificationModel';
import { CustomError } from '../errors/customErrors';
import { HttpStatusCodes } from '../config/HttpStatusCodes';

export class NotificationRepository implements INotificationRepository {
  async create(notification: Partial<INotification>): Promise<INotification> {
    try {
      return await NotificationModel.create(notification);
    } catch (error: any) {
      throw new CustomError('Failed to create notification', HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(): Promise<INotification[]> {
    try {
      return await NotificationModel.find().sort({ createdAt: -1 });
    } catch (error: any) {
      throw new CustomError('Failed to fetch notifications', HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}