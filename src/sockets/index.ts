import { Server, Socket } from "socket.io";
import { ServerToClientEvents, ClientToServerEvents } from "./Types/socketTypes"; // Import types
import { handleUserEvents } from "./userSocket";
import { handleAdminEvents } from "./adminSocket";

export function registerSocketEvents(io: Server<ClientToServerEvents, ServerToClientEvents>) {
  io.on("connection", (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    console.log(`Socket connected: ${socket.id}`);

    // Handle user and admin-specific events
    handleUserEvents(socket, io); // Register user events
    handleAdminEvents(socket, io); // Register admin events
  });
}
