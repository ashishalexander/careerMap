import { INotification } from '../../models/NotificationModel';

export interface INotificationRepository {
  create(notification: Partial<INotification>): Promise<INotification>;
  findAll(): Promise<INotification[]>;
}