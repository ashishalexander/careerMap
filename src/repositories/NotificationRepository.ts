import { INotificationRepository } from './interfaces/INotificationRepository';
import NotificationModel, { INotification } from '../models/NotificationModel';
import { CustomError } from '../errors/customErrors';
import { HttpStatusCodes } from '../config/HttpStatusCodes';
import { IUserNotification, UserNotification } from '../models/userNotificationSchema';
import { IUser, UserModel } from '../models/userModel';

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

  async findUserNotifications(userId: string): Promise<IUserNotification[]> {
    try {
      return await UserNotification.find({ receiverId: userId })
        .populate('senderId', 'firstName lastName profile.profilePicture') // Populate sender details
        .populate('postId', 'text media') // Populate post details if needed
        .sort({ createdAt: -1 })
        .lean();
    } catch (error: any) {
      throw new CustomError('Failed to fetch user notifications', HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async findUserById(userId: string): Promise<IUser | null> {
    try {
      return await UserModel.findById(userId, 'firstName lastName profile.profilePicture').lean();
    } catch (error: any) {
      throw new CustomError('Failed to fetch user details', HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}