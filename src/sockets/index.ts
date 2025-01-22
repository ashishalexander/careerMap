import { Server } from "socket.io";
import { ServerToClientEvents, ClientToServerEvents, SocketCustom } from "./Types/socketTypes";
import { handleUserEvents } from "./userSocket";
import { handleAdminEvents } from "./adminSocket";
import { NotificationSocketHandler } from "./NotificationSocketHandler";
import { ChatRepository } from "../repositories/ChatRepository";
import { ChatService } from "../services/ChatService";
import { ChatSocketHandler } from "./ChatSocketHandler";

export function registerSocketEvents(io: Server<ClientToServerEvents, ServerToClientEvents>) {
  const notificationHandler = new NotificationSocketHandler(io);
  const chatRepository = new ChatRepository();
  const chatService = new ChatService(chatRepository);
  const chatSocketHandler = new ChatSocketHandler(io, chatService);

  chatSocketHandler.initialize();

  io.on("connection", (socket: SocketCustom) => {
    console.log(`Socket connected in index.ts: ${socket.id}`);
    // Handle user and admin-specific events
    handleUserEvents(socket, io);
    handleAdminEvents(socket, io);

    
  });

  return {
    chatHandler: chatSocketHandler,
    notificationHandler
  };
}