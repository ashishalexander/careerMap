import { Types } from "mongoose";
import { IUser } from "../../models/userModel";
import { IUserNotification } from "../../models/userNotificationSchema";

export interface IUserNetworkRepository{
    getPendingRequests(userId: string): Promise<any>;
    getSuggestions(userId: string, page: number, search: string): Promise<any>
    addPendingRequest(userId: string, requestedUserId: string): Promise<{ success: boolean; message: string }>   
    findById(id: string | Types.ObjectId): Promise<IUser | null>
    updateRequestStatus(requestId: string, status: string): Promise<any>
    addPendingRequest(userId: string, requestedUserId: string): Promise<{ success: boolean; message: string }>
    addConnection(userId: string, connectionId: string): Promise<void>
    removePendingRequest(userId: string, requestId: string): Promise<void>
    getRequestById(requestId: string, userId: string): Promise<any | null>
    // removeConnection(userId: string, connectionId: string): Promise<void>
    saveNotification(notification: Partial<IUserNotification>): Promise<IUserNotification>

}

export interface IConnectionRequest{
    _id:string
}

export interface ISuggestionsData {
    suggestions: {
      _id:string;
      firstName: string;
      lastName: string;
      profile: {
        headline: string;
        profilePicture: string;
        bannerImage: string;
        location: string;
        company: string;
      };
    }[];
    nextPage: number | null;
    total: number;
  }
  