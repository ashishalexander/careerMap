import { INotification } from '../../models/NotificationModel';
import { IUser } from '../../models/userModel';
import { IUserNotification } from '../../models/userNotificationSchema';

export interface INotificationRepository {
  create(notification: Partial<INotification>): Promise<INotification>;
  findAll(): Promise<INotification[]>;
  findUserNotifications(userId: string): Promise<IUserNotification[]>
  findUserById(userId: string): Promise<IUser | null>
}