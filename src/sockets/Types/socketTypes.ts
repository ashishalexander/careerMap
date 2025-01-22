import { Socket } from "socket.io";
import { INotification } from "../../models/NotificationModel";

// Define the events that can be emitted from the server to the client
export interface ServerToClientEvents {
  "force-logout": (data: { message: string }) => void; // Used when an admin blocks a user
  broadcast: (data: { message: string }) => void; // Used for admin broadcasting messages
  "notification:received": (notification: INotification) => void; // Add notification event
  "notification:error": (error: { message: string }) => void; // Add error handling
  receive_message: (message: {
    id: string;
    chatId: string;
    content: string;
    senderId: string;
    receiverId: string;
    timestamp: Date;
    type: 'text' | 'image' | 'file';
  }) => void;
  messages_read: (data: { roomId: string; userId: string }) => void;
  new_message_notification: (data: {
    chatId: string;
    senderId: string;
    preview: string;
  }) => void;
  error: (error: { message: string }) => void;
}

// Define the events that can be emitted from the client to the server
export interface ClientToServerEvents {
  "register": (userId: string) => void; // Used when a user registers their socket
  "register-admin": (adminId: string) => void;  // Add this line to allow the "register-admin" event
  "block-user": (userId: string) => void; // Used when an admin blocks a user
  "broadcast-message": (message: string) => void; // Used when an admin sends a broadcast message
  "notification:acknowledge": (notificationId: string) => void; // Add acknowledgment
  join_room: (roomId: string) => void;
  leave_room: (roomId: string) => void;
  send_message: (data: {
    roomId: string;
    content: string;
    receiverId: string;
  }) => void;
  mark_messages_read: (roomId: string) => void;
}

// Define the events that are emitted to all connected sockets (server to server)
export interface InterServerEvents {
  ping: () => void; // Example of a ping event, used for checking server status or keeping alive
}
// Define the socket data structure
export interface SocketData {
  userId?: string;
  isAdmin?: boolean;
}

// Define the custom socket instance type that includes both ClientToServer and ServerToClient events
export interface SocketCustom extends Socket<ClientToServerEvents, ServerToClientEvents> {
  // You can extend this with more custom properties if needed in the future
  userData?: SocketData;

}
    