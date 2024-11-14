import { IUser } from "../../models/userModel";

export interface IUserProfileRepository{
    updateUserProfile(userId: string, updateData: Partial<IUser>) : Promise<IUser>
}