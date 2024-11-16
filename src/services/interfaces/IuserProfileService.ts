import { IUser } from "../../models/userModel"
export interface IUserProfileService{
    updateUserProfile(userId: string, updateData: Partial<IUser>): Promise<IUser>;
    updateUserAbout(userId: string, about: string): Promise<IUser>
}