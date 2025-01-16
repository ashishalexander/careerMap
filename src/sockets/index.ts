import { Server, Socket } from "socket.io";
import { ServerToClientEvents, ClientToServerEvents, SocketCustom } from "./Types/socketTypes";
import { handleUserEvents } from "./userSocket";
import { handleAdminEvents } from "./adminSocket";
import { NotificationSocketHandler } from "./NotificationSocketHandler";

export function registerSocketEvents(io: Server<ClientToServerEvents, ServerToClientEvents>) {
  const notificationHandler = new NotificationSocketHandler(io);

  io.on("connection", (socket: SocketCustom) => {
    console.log(`Socket connected: ${socket.id}`);
    // Handle user and admin-specific events
    handleUserEvents(socket, io);
    handleAdminEvents(socket, io);

    
  });

  return notificationHandler; // Return this to use in your NotificationService
}