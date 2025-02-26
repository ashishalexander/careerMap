import { IChatRepository } from './interfaces/IChatRepository';
import { UserModel } from '../models/userModel';
import { ChatModel, IChat } from '../models/ChatModel';
import { HttpStatusCodes } from '../config/HttpStatusCodes';
import { CustomError } from '../errors/customErrors';
import { IMessage, MessageModel } from '../models/MessageModel';

export class ChatRepository implements IChatRepository {
  async findConnectedUsers(userId: string): Promise<any> {
    const user = await UserModel.findById(userId).populate('Network.connections.userId', 'firstName lastName email profile.profilePicture');
    if (!user) {
      throw new Error('User not found');
    }

    return user.Network.connections.map((connection) => connection.userId);
  }

  async getChatRooms(userId: string): Promise<IChat[]> {
    const chats = await ChatModel.find({
      participants: userId,
    })
      .populate('lastMessage', 'content createdAt sender') // Populate last message fields
      .populate('participants', 'firstName lastName profile.profilePicture') // Populate participant details
      .sort({ updatedAt: -1 }) // Sort by most recent activity
      .lean(); // Return plain JavaScript objects

    return chats;
  }

  async createChatRoom(userId: string, participantId: string): Promise<IChat | null> {
    if (!userId || !participantId) {
      throw new CustomError('Both userId and participantId are required', HttpStatusCodes.BAD_REQUEST);
    }
    if (userId === participantId) {
      throw new CustomError('A user cannot create a chat room with themselves', HttpStatusCodes.BAD_REQUEST);
    }
  
    // Check if chat room already exists
    const existingChat = await ChatModel.findOne({
      participants: { $all: [userId, participantId] },
    });
  
    if (existingChat) {
      return existingChat.populate('participants', 'firstName lastName profile.profilePicture');
    }
  
    // Create new chat room
    const chat = await ChatModel.create({
      participants: [userId, participantId],
    });
  
    await chat.populate('participants', 'firstName lastName profile.profilePicture');
    return chat;
  }

  async getChatHistory(roomId: string, limit = 50, before?: Date): Promise<IMessage[]> {
    const query: any = { chat: roomId };
    if (before) {
      query.createdAt = { $lt: before };
    }

    const messages = await MessageModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'firstName lastName profile.profilePicture')
      .lean<IMessage[]>()
      .exec();

    return messages.reverse();
  }

  async createMessage(data: {
    chatId: string;
    senderId: string;
    content: string;
    type?: 'text' | 'image' | 'file';
  }): Promise<IMessage> {
    const message = await MessageModel.create({
      chat: data.chatId,
      sender: data.senderId,
      content: data.content,
      type: data.type || 'text',
      readBy: [data.senderId]
    });

    // Update chat's lastMessage
    await ChatModel.findByIdAndUpdate(data.chatId, {
      lastMessage: message._id,
      updatedAt: new Date()
    });

    return message.populate('sender', 'firstName lastName profile.profilePicture');
  }

  async markMessagesAsRead(roomId: string, userId: string): Promise<void> {
    await MessageModel.updateMany(
      { chat: roomId, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } } // Add userId to the `readBy` array
    );
  }
}
