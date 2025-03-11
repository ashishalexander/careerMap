// sockets/ChatSocketHandler.ts
import { Server } from "socket.io";
import { ChatService } from "../services/ChatService";
import { ServerToClientEvents, ClientToServerEvents, SocketCustom, VideoCallSignal, CallInitiation, EndCall } from "./Types/socketTypes";


export class ChatSocketHandler {
  private io: Server;
  private chatService: ChatService;
  private activeUsers: Map<string, Set<string>> = new Map(); // userId -> Set of roomIds
  private activeCalls: Map<string, {
    participants: Set<string>;
    startTime: Date;
    signals: Map<string, any>; // Track signaling state for each participant
  }> = new Map();
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
    this.registerVideoCallEvents(socket);


    // Handle disconnect
    socket.on("disconnect", () => {
      this.handleDisconnect(socket);
    });
  }


  private registerVideoCallEvents(socket: SocketCustom) {
    const userId = socket.handshake.query.userId as string;

    socket.on("initiate_video_call", async (data: CallInitiation) => {
      try {
        // Validate participants
        const isValidCall = await this.validateCallParticipants(data.roomId, [userId, data.to]);
        if (!isValidCall) {
          throw new Error("Invalid call participants");
        }
    
        // Check if either participant is already in a call
        if (this.isUserInCall(userId) || this.isUserInCall(data.to)) {
          socket.emit("error", { message: "One or more participants are already in a call" });
          return;
        }
    
        // Initialize call tracking with signaling state
        this.activeCalls.set(data.roomId, {
          participants: new Set([userId, data.to]),
          startTime: new Date(),
          signals: new Map()
        });
    
        // Notify the receiver - Fix: Include the 'from' field
        this.io.to(data.to).emit("incoming_video_call", {
          roomId: data.roomId,
          from: userId,
          to: data.to
        });
    
        console.log(`Video call initiated in room ${data.roomId} from ${userId} to ${data.to}`);
      } catch (error) {
        console.error(`Error initiating video call:`, error);
        socket.emit("error", { message: "Failed to initiate video call" });
      }
    });
    

    socket.on("video_call_signal", async (data: VideoCallSignal) => {
      try {
        const activeCall = this.activeCalls.get(data.roomId);
        
        if (!activeCall) {
          console.log("No active call found for room:", data.roomId);
          return;
        }
    
        if (!activeCall.participants.has(userId) || !activeCall.participants.has(data.to)) {
          console.log("Invalid participants for call:", userId, data.to);
          return;
        }
    
        // Store and forward the signal immediately
        if (data.signal) {  // Only process if signal exists
          activeCall.signals.set(userId, data.signal);
          
          console.log("Forwarding signal from", userId, "to", data.to);
          this.io.to(data.to).emit("video_call_signal", {
            roomId: data.roomId,
            signal: data.signal,
            from: userId,
            to: data.to
          });
        }
      } catch (error) {
        console.error(`Error handling video call signal:`, error);
        socket.emit("error", { message: "Failed to process video call signal" });
        this.cleanupCall(data.roomId);
      }
    });
    socket.on("end_video_call", (data: EndCall) => {
      try {
        const activeCall = this.activeCalls.get(data.roomId);
        
        if (activeCall) {
          const duration = new Date().getTime() - activeCall.startTime.getTime();
          
          // Notify all participants
          activeCall.participants.forEach(participantId => {
            this.io.to(participantId).emit("end_video_call", {
              roomId: data.roomId,
              endedBy: userId,
              duration
            });
          });

          this.cleanupCall(data.roomId);
          
          console.log(`Video call ended in room ${data.roomId} by ${userId}. Duration: ${duration}ms`);
        }
      } catch (error) {
        console.error(`Error ending video call:`, error);
        this.cleanupCall(data.roomId);
      }
    });

    // Handle call rejection
    socket.on("reject_video_call", (data: { roomId: string; to: string }) => {
      try {
        this.io.to(data.to).emit("video_call_rejected", {
          roomId: data.roomId,
          by: userId
        });
        this.cleanupCall(data.roomId);
      } catch (error) {
        console.error(`Error rejecting video call:`, error);
      }
    });
  }

  private isUserInCall(userId: string): boolean {
    for (const call of this.activeCalls.values()) {
      if (call.participants.has(userId)) {
        return true;
      }
    }
    return false;
  }

  private cleanupCall(roomId: string) {
    // Remove call tracking and clean up any associated resources
    this.activeCalls.delete(roomId);
  }

  private async validateCallParticipants(roomId: string, participantIds: string[]): Promise<boolean> {
    try {
      // Get chat room details
      const chat = await this.chatService.getChatRooms(participantIds[0]);
      const room = chat.find(r => r._id.toString() === roomId);
      
      if (!room) {
        console.error(`Room ${roomId} not found`);
        return false;
      }

      // Verify all participants are members of the chat room
      const allParticipantsValid = participantIds.every(pid => 
        room.participants.some(p => p._id.toString() === pid)
      );

      if (!allParticipantsValid) {
        console.error(`Invalid participants for room ${roomId}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Error validating call participants:`, error);
      return false;
    }
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