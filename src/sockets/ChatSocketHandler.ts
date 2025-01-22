// sockets/ChatSocketHandler.ts
import { Server } from "socket.io";
import { ChatService } from "../services/ChatService";
import { ServerToClientEvents, ClientToServerEvents, SocketCustom } from "./Types/socketTypes";


export class ChatSocketHandler {
  private io: Server;
  private chatService: ChatService;
  private activeUsers: Map<string, Set<string>> = new Map(); // userId -> Set of roomIds

  constructor(io: Server<ClientToServerEvents, ServerToClientEvents>, chatService: ChatService) {
    this.io = io;
    this.chatService = chatService;
  }

  public initialize() {
    this.io.on("connection", (socket: SocketCustom) => {
      console.log(`Chat socket connected: ${socket.id}`);
      this.handleConnection(socket);
    });
  }

  private handleConnection(socket: SocketCustom) {
    // Join personal room for user-specific updates
    const userId = socket.handshake.query.userId as string;
    if (userId) {
      socket.join(userId);
      this.activeUsers.set(userId, new Set());
    }

    // Handle chat events
    this.registerChatEvents(socket);

    // Handle disconnect
    socket.on("disconnect", () => {
      this.handleDisconnect(socket);
    });
  }

  private registerChatEvents(socket: SocketCustom) {
    const userId = socket.handshake.query.userId as string;

    // Join chat room
    socket.on("join_room", async (roomId: string) => {
      try {
        // Verify user is a participant of this chat
        const chat = await this.chatService.getChatRooms(userId);
        console.log(JSON.stringify(chat),userId,roomId)
        const isParticipant = chat.some(room => 
          room._id.toString() === roomId && 
          room.participants.some(p => p._id.toString() === userId)
        );

        if (!isParticipant) {
          throw new Error("User is not a participant of this chat");
        }

        // Join the room
        socket.join(roomId);
        
        // Track active rooms for user
        const userRooms = this.activeUsers.get(userId) || new Set();
        userRooms.add(roomId);
        this.activeUsers.set(userId, userRooms);

        console.log(`User ${userId} joined chat room: ${roomId}`);
      } catch (error) {
        console.error(`Error joining chat room:`, error);
        socket.emit("error", { message: "Failed to join chat room" });
      }
    });

    // Leave chat room
    socket.on("leave_room", (roomId: string) => {
      socket.leave(roomId);
      const userRooms = this.activeUsers.get(userId);
      if (userRooms) {
        userRooms.delete(roomId);
      }
      console.log(`User ${userId} left chat room: ${roomId}`);
    });

    // Handle new message
    socket.on("send_message", async (data: {
      roomId: string;
      content: string;
      receiverId: string;
    }) => {
      try {
        const { roomId, content, receiverId } = data;

        // Create message in database
        const newMessage = await this.chatService.createMessage({
          chatId: roomId,
          senderId: userId,
          content,
          type: 'text'
        });

        // Format message for clients
        const messageData = {
          id: newMessage.id,
          chatId: roomId,
          content: newMessage.content,
          senderId: userId,
          receiverId,
          timestamp: new Date(),
          type: newMessage.type
        };

        // Emit to all users in the room
        this.io.to(roomId).emit("receive_message", messageData);

        // Send notification to receiver if they're not in the room
        const receiverRooms = this.activeUsers.get(receiverId);
        if (!receiverRooms?.has(roomId)) {
          this.io.to(receiverId).emit("new_message_notification", {
            chatId: roomId,
            senderId: userId,
            preview: content.substring(0, 50)
          });
        }

      } catch (error) {
        console.error(`Error sending message:`, error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Mark messages as read
    // socket.on("mark_messages_read", async (roomId: string) => {
    //   try {
    //     await this.chatService.markMessagesAsRead(roomId, userId);
        
    //     // Notify other participants that messages were read
    //     this.io.to(roomId).emit("messages_read", {
    //       roomId,
    //       userId
    //     });
    //   } catch (error) {
    //     console.error(`Error marking messages as read:`, error);
    //   }
    // });
  }

  private handleDisconnect(socket: SocketCustom) {
    const userId = socket.handshake.query.userId as string;
    if (userId) {
      // Remove user from active users tracking
      this.activeUsers.delete(userId);
      console.log(`Chat socket disconnected: ${socket.id}, User: ${userId}`);
    }
  }
}