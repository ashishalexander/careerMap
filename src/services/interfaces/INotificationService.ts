import { INotification } from '../../models/NotificationModel';

export interface INotificationService {
  createNotification(data: Partial<INotification>): Promise<INotification>;
  getAllNotifications(): Promise<INotification[]>;
}