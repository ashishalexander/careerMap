import { IConnectionRequest } from "../../repositories/interfaces/IUserNetworkRepository";

export interface IUserNetworkService{
    getPendingRequests(userId: string): Promise<IConnectionRequest[]>;
    // acceptRequest(userId: string, requestId: string): Promise<void>;
    // rejectRequest(userId: string, requestId: string): Promise<void>
}