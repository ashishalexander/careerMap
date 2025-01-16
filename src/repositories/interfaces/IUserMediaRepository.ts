import { IPost } from "../../models/mediaModel";
import { IUserNotification } from "../../models/userNotificationSchema";

export interface IUserMediaRepository {
  create(postData: Partial<IPost>): Promise<any>;
  getUserConnections(userId: string): Promise<string[]>;
  getPostsByConnections(connections: string[],skip: number,limit: number): Promise<any[]>;
  removeLike(postId: string, userId: string): Promise<any>
  addLike(postId: string, userId: string): Promise<any>
  isPostLikedByUser(postId: string, userId: string): Promise<boolean>
  addComment(postId: string, userId: string, content: string): Promise<any>
  getPostById(postId: string): Promise<IPost | null>
  saveNotification(notification: Partial<IUserNotification>): Promise<IUserNotification>
}
