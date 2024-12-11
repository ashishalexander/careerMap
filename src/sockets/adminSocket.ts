import { Socket, Server } from "socket.io";
import { ServerToClientEvents, ClientToServerEvents } from "./Types/socketTypes"; // Import types

export function handleAdminEvents(socket: Socket<ClientToServerEvents, ServerToClientEvents>, io: Server) {
  socket.on("register-admin", (adminId: string) => {
    socket.join(`admin-${adminId}`);
    console.log(`Admin ${adminId} joined room admin-${adminId}`);
  });

  socket.on("block-user", (userId: string) => {
    console.log(`Admin requested to block user: ${userId}`);
    io.to(`user-${userId}`).emit("force-logout", { message: "Your account has been blocked by an admin." });
  });

  socket.on("broadcast-message", (message: string) => {
    console.log(`Admin is broadcasting: ${message}`);
    io.emit("broadcast", { message });
  });

  socket.on("disconnect", () => {
    console.log(`Admin disconnected: ${socket.id}`);
  });
}
