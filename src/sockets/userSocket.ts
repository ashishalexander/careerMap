import { Socket, Server } from "socket.io";
import {  SocketCustom } from "./Types/socketTypes"; // Import types

export function handleUserEvents(socket: SocketCustom, io: Server) {
  socket.on("register", (userId: string) => {
      // Store user data in socket for reference
      socket.userData = {
        userId,
        isAdmin:false
      };
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined room user-${userId}`);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
}
