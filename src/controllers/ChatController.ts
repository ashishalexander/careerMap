import { Request, Response, NextFunction } from 'express';
import { IChatService } from '../services/interfaces/IChatService';
import { CustomError } from '../errors/customErrors';
import { HttpStatusCodes } from '../config/HttpStatusCodes';
import { IChatController } from './interfaces/IChatController';

export class ChatController implements IChatController {
  private chatService: IChatService;

  constructor(chatService: IChatService) {
    this.chatService = chatService;
  }

  async getConnectedUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params; // Assuming userId is passed as a parameter
      if (!userId) {
        throw new CustomError('User ID is required', HttpStatusCodes.BAD_REQUEST);
      }

      const connectedUsers = await this.chatService.getConnectedUsers(userId);
      res.status(HttpStatusCodes.OK).json({ data: connectedUsers });
    } catch (error: any) {
      console.log(error)
      next(new CustomError(error.message, error.status || HttpStatusCodes.INTERNAL_SERVER_ERROR));
    }
  }

  async getChatRooms(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params; // Assuming userId is passed as a parameter
      if (!userId) {
        throw new CustomError('User ID is required', HttpStatusCodes.BAD_REQUEST);
      }

      const chatRooms = await this.chatService.getChatRooms(userId);
      res.status(HttpStatusCodes.OK).json({ data: chatRooms });
    } catch (error: any) {
      next(new CustomError(error.message, error.status || HttpStatusCodes.INTERNAL_SERVER_ERROR));
    }
  }

  async createChatRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { participantId } = req.body;
      const { userId } = req.params;
  
      if (!userId || !participantId) {
        throw new CustomError('Both userId and participantId are required', HttpStatusCodes.BAD_REQUEST);
      }
  
      const chat = await this.chatService.createChatRoom(userId, participantId);
      const status = chat ? HttpStatusCodes.CREATED : HttpStatusCodes.OK;
  
      res.status(status).json({ data: chat });
    } catch (error: any) {
      next(new CustomError(error.message, error.status || HttpStatusCodes.INTERNAL_SERVER_ERROR));
    }
  }

  getChatHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { roomId,userId } = req.params;
      console.log(userId,roomId)
      const { before, limit } = req.query;
      
      const messages = await this.chatService.getChatHistory(
        roomId,
        userId,
        limit ? parseInt(limit as string) : undefined,
        before ? new Date(before as string) : undefined
      );
      
      res.status(HttpStatusCodes.OK).json({data:messages});
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Error fetching chat history' });
    }
  };

}
