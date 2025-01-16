import { IUserNotification } from "../../models/userNotificationSchema";
import { IConnectionRequest } from "../../repositories/interfaces/IUserNetworkRepository";

export interface IUserNetworkService{
    getPendingRequests(userId: string): Promise<IConnectionRequest[]>;
    getSuggestions(userId: string, page: number, search: string): Promise<any>
    connect(userId: string, RequserId: string): Promise<any>
    acceptRequest(userId: string, requestId: string): Promise<any> 
    rejectRequest(userId: string, requestId: string): Promise<any>
    
} 