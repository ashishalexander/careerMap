import { Server } from "socket.io";
import { ServerToClientEvents, ClientToServerEvents, SocketCustom } from "./Types/socketTypes";
import { INotification } from '../models/NotificationModel';
import { IUserNotification } from "../models/userNotificationSchema";


export class NotificationSocketHandler {
  private io: Server;
  private connectedUsers: Map<string, SocketCustom> = new Map();

  constructor(io: Server<ClientToServerEvents, ServerToClientEvents>) {
    this.io = io;
  }

  // Method to handle new notifications
  public broadcastNotification(notification: INotification) {
    console.log("Broadcasting notification:", notification); // Debugging log
    this.io.emit("admin:notification", notification);
    console.log("Connected clients:", this.io.sockets); // Check if there are connected clients
  }

   // Send a like notification to a specific user
   public sendLikeNotification(postOwnerId: string, likerId: string, postId: string) {
    const notification: Partial<IUserNotification> = {
      type: "like",
      postId,
      senderId: likerId,
      message: `${likerId} liked your post.`,
    };

    this.io.to(postOwnerId).emit("user:notification", notification);
    console.log(`Sent like notification to user: ${postOwnerId}`);
  }

  // Send a comment notification to a specific user
  public sendCommentNotification(postOwnerId: string, commenterId: string, postId: string, comment: string) {
    const notification: Partial<IUserNotification> = {
      type: "comment",
      postId,
      senderId: commenterId,
      message: `${commenterId} commented on your post: "${comment}"`,
    };

    this.io.to(postOwnerId).emit("user:notification", notification);
    console.log(`Sent comment notification to user: ${postOwnerId}`);
  }

  
  
}