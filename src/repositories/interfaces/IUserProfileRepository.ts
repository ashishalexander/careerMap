import { IUser } from "../../models/userModel";

export interface IUserProfileRepository{
    updateUserProfile(userId: string, updateData: Partial<IUser>) : Promise<IUser>;
    updateUserAbout(userId: string, about: string): Promise<IUser>;
    updateUserEducation(userId: string, Education: Partial<IUser>): Promise<IUser>;
    deleteUserEducation(userId: string, educationId: string): Promise<IUser>
}