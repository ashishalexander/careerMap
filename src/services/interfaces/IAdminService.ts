import { PaginatedResponse, QueryParams } from "../../interfaces/listingPage";
import { AdminDocument } from "../../models/adminModel";

export interface IAdminService{
    authenticate(email:string,password:string): Promise<{admin: AdminDocument, accessToken: string, refreshToken: string}>;
    fetchAllUsers(queryParams: QueryParams): Promise<PaginatedResponse>;    
    blockUser(userId:string):Promise<void>;
}