import { INotification } from '../../models/NotificationModel';
import { IUser } from '../../models/userModel';
import { IUserNotification } from '../../models/userNotificationSchema';

export interface INotificationService {
  createNotification(data: Partial<INotification>): Promise<INotification>;
  getAllNotifications(): Promise<INotification[]>;
  getUserNotifications(userId: string): Promise<IUserNotification[]>
  getUserById(userId: string): Promise<IUser>

}