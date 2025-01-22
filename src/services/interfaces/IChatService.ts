import { IChat } from "../../models/ChatModel";
import { IMessage } from "../../models/MessageModel";
import { IUser } from "../../models/userModel";

export interface IChatService{
    getConnectedUsers(userId: string): Promise<IUser[]>
    getChatRooms(userId: string): Promise<IChat[]>
    createChatRoom(userId: string, participantId: string): Promise<IChat>
    getChatHistory(roomId: string,userId: string,limit?: number,before?: Date): Promise<IMessage[]>}