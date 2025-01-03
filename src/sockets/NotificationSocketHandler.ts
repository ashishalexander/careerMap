import { Server } from "socket.io";
import { ServerToClientEvents, ClientToServerEvents, SocketCustom } from "./Types/socketTypes";
import { INotification } from '../models/NotificationModel';

export class NotificationSocketHandler {
  private io: Server;
  private connectedUsers: Map<string, SocketCustom> = new Map();

  constructor(io: Server<ClientToServerEvents, ServerToClientEvents>) {
    this.io = io;
  }

  // Method to handle new notifications
  public broadcastNotification(notification: INotification) {
    console.log("Broadcasting notification:", notification); // Debugging log
    this.io.emit("notification:received", notification);
    console.log("Connected clients:", this.io.sockets); // Check if there are connected clients

  }

  // Method to handle notification events for a specific socket
//   public handleNotificationEvents(socket: SocketCustom) {
//     // Handle notification acknowledgment
//     socket.on("notification:acknowledge", (notificationId: string) => {
//       console.log(`User ${socket.userData?.userId} acknowledged notification ${notificationId}`);
//       // Here you can add logic to mark the notification as read in your database
//     });
//   }

  // Method to handle errors
  public sendNotificationError(userId: string, error: string) {
    this.io.to(`user-${userId}`).emit("notification:error", { message: error });
  }
}