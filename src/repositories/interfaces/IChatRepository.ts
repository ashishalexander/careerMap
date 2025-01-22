import { IChat } from "../../models/ChatModel";
import { IMessage } from "../../models/MessageModel";
import { IUser } from "../../models/userModel";

export interface IChatRepository {
    findConnectedUsers(userId: string): Promise<IUser[]>;
    getChatRooms(userId: string): Promise<IChat[]>;
    createChatRoom(userId: string, participantId: string): Promise<IChat | null>
    markMessagesAsRead(roomId: string, userId: string): Promise<void>
    createMessage(data: {chatId: string;senderId: string;content: string;type?: 'text' | 'image' | 'file';}): Promise<IMessage>
    getChatHistory(roomId: string, limit:number, before?: Date): Promise<IMessage[]>
  }