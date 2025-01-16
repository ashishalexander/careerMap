import { INotificationService } from './interfaces/INotificationService';
import { INotificationRepository } from '../repositories/interfaces/INotificationRepository';
import { INotification } from '../models/NotificationModel';
import { CustomError } from '../errors/customErrors';
import { HttpStatusCodes } from '../config/HttpStatusCodes';
import { NotificationSocketHandler } from '../sockets/NotificationSocketHandler';
import { IUserNotification } from '../models/userNotificationSchema';
import { IUser } from '../models/userModel';

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

  async getUserNotifications(userId: string): Promise<IUserNotification[]> {
    if (!userId) {
      throw new CustomError('User ID is required', HttpStatusCodes.BAD_REQUEST);
    }
  
    return this.notificationRepository.findUserNotifications(userId);
  } 


  async getUserById(userId: string): Promise<IUser> {
    if (!userId) {
      throw new CustomError('User ID is required', HttpStatusCodes.BAD_REQUEST);
    }
  
    const user = await this.notificationRepository.findUserById(userId);
  
    if (!user) {
      throw new CustomError('User not found', HttpStatusCodes.NOT_FOUND);
    }
  
    return user;
  }
}