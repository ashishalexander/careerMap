export interface IUserNetworkRepository{
    getPendingRequests(userId: string): Promise<any>
    // sendConnectionRequest(fromUserId: string, toUserId: string): Promise<void>;
    // acceptConnectionRequest(userId: string, requesterId: string): Promise<void>;
    // rejectConnectionRequest(userId: string, requesterId: string): Promise<void>;
    // removeConnection(userId: string, connectionId: string): Promise<void>

}

export interface IConnectionRequest{
    _id:string
}