import { AdminDocument } from "../../models/adminModel";
import { IUser } from "../../models/userModel";

export interface IAdminService{
    authenticate(email:string,password:string): Promise<{admin: AdminDocument, accessToken: string, refreshToken: string}>;
    fetchAllUsers(): Promise<IUser[]>
    blockUser(userId:string):Promise<void>
}