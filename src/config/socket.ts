import { Server } from "socket.io";
import { Server as HTTPServer } from "http";
import { ServerToClientEvents, ClientToServerEvents } from "../sockets/Types/socketTypes"; // Import types

let io: Server<ClientToServerEvents, ServerToClientEvents>;

export function initSocket(httpServer: HTTPServer) {
  io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL||'http://localhost:3000', // Frontend URL
      credentials: true, // Add this
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],

    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Handle events for users and admins
  require("../sockets/index").registerSocketEvents(io);  // Register socket events

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    console.log(`Active connections: ${io.sockets.sockets.size}`);

 
    // Clean up on disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getSocketIO(): Server<ClientToServerEvents, ServerToClientEvents> {
  if (!io) {
    throw new Error("Socket.IO is not initialized. Call initSocket first.");
  }
  return io;
}
