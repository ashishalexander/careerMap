import { Socket, Server } from "socket.io";
import { ServerToClientEvents, ClientToServerEvents } from "./Types/socketTypes"; // Import types

export function handleUserEvents(socket: Socket<ClientToServerEvents, ServerToClientEvents>, io: Server) {
  socket.on("register", (userId: string) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined room user-${userId}`);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
}
