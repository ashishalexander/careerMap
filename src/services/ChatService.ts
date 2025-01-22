import { IChatService } from './interfaces/IChatService';
import { IChatRepository } from '../repositories/interfaces/IChatRepository';
import { IUser } from '../models/userModel';
import { CustomError } from '../errors/customErrors';
import { HttpStatusCodes } from '../config/HttpStatusCodes';
import { IChat } from '../models/ChatModel';
import { IMessage } from '../models/MessageModel';

export class ChatService implements IChatService {
  private chatRepository: IChatRepository;

  constructor(chatRepository: IChatRepository) {
    this.chatRepository = chatRepository;
  }

  async getConnectedUsers(userId: string): Promise<IUser[]> {
    if (!userId) {
      throw new CustomError('User ID is required', HttpStatusCodes.BAD_REQUEST);
    }

    const connectedUsers = await this.chatRepository.findConnectedUsers(userId);
    
    return connectedUsers;
  }

  async getChatRooms(userId: string): Promise<IChat[]> {
    if (!userId) {
      throw new CustomError('User ID is required', HttpStatusCodes.BAD_REQUEST);
    }

    const chatRooms = await this.chatRepository.getChatRooms(userId);
    return chatRooms;
  }

  async createChatRoom(userId: string, participantId: string): Promise<IChat> {
    if (!userId || !participantId) {
      throw new CustomError('Both userId and participantId are required', HttpStatusCodes.BAD_REQUEST);
    }

    // Check if a chat room already exists
    const existingChat = await this.chatRepository.createChatRoom(userId, participantId);
    if (existingChat) {
      return existingChat;
    }

    // Create a new chat room
    const newChat = await this.chatRepository.createChatRoom(userId, participantId);
    if (!newChat) {
      throw new CustomError('Failed to create a new chat room', HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }

    return newChat;
  }

  async getChatHistory(
    roomId: string,
    userId: string,
    limit: number,
    before?: Date
  ): Promise<IMessage[]> {
    try {
      if (!roomId || !userId) {
        throw new CustomError('Room ID and User ID are required', HttpStatusCodes.BAD_REQUEST);
      }

      await this.chatRepository.markMessagesAsRead(roomId, userId);

      const chatHistory = await this.chatRepository.getChatHistory(roomId, limit=50, before); 

      return chatHistory;
    } catch (error) {
      console.error(`Error fetching chat history for room ${roomId}:`, error);

      if (error instanceof CustomError) {
        throw error;
      }

      throw new CustomError('Failed to fetch chat history', HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async createMessage(data: {
    chatId: string;
    senderId: string;
    content: string;
    type?: 'text' | 'image' | 'file';
  }) {
    return this.chatRepository.createMessage(data);
  }
}
