import { PaginatedResponse, QueryParams } from "../../interfaces/listingPage";
import { AdminDocument } from "../../models/adminModel";
import { IUser } from "../../models/userModel";

export interface IAdminService{
    authenticate(email:string,password:string): Promise<{admin: AdminDocument, accessToken: string, refreshToken: string}>;
    fetchAllUsers(queryParams: QueryParams): Promise<PaginatedResponse>;    
    blockUser(userId:string):Promise<void>;
}