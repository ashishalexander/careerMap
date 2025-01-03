import { INotificationService } from './interfaces/INotificationService';
import { INotificationRepository } from '../repositories/interfaces/INotificationRepository';
import { INotification } from '../models/NotificationModel';
import { CustomError } from '../errors/customErrors';
import { HttpStatusCodes } from '../config/HttpStatusCodes';
import { NotificationSocketHandler } from '../sockets/NotificationSocketHandler';

export class NotificationService implements INotificationService {
  private notificationRepository: INotificationRepository;
  private notificationSocketHandler: NotificationSocketHandler;

  constructor(
    notificationRepository: INotificationRepository, 
    notificationSocketHandler: NotificationSocketHandler
  ) {
    this.notificationRepository = notificationRepository;
    this.notificationSocketHandler = notificationSocketHandler;
  }

  async createNotification(data: Partial<INotification>): Promise<INotification> {
    if (!data.title || !data.message) {
      throw new CustomError('Title and message are required', HttpStatusCodes.BAD_REQUEST);
    }

    const notification = await this.notificationRepository.create(data);
    this.notificationSocketHandler.broadcastNotification(notification);
    return notification;
  }

  async getAllNotifications(): Promise<INotification[]> {
    return this.notificationRepository.findAll();
  }
}