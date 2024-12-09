import { IUser } from "../../models/userModel";
import { IExperience } from "../../services/interfaces/IuserProfileService";

export interface IUserProfileRepository{
    updateUserProfile(userId: string, updateData: Partial<IUser>) : Promise<IUser>;
    updateUserAbout(userId: string, about: string): Promise<IUser>;
    updateUserEducation(userId: string, Education: Partial<IUser>): Promise<IUser>;
    editUserEducation(userId:string,Education:Partial<IUser>,EducationId:string):Promise<IUser|null>
    deleteUserEducation(userId: string, educationId: string): Promise<IUser>;
    updateUserExperience(userId: string, editingIndex: string, experienceData: any): Promise<IUser>;
    addUserExperience(userId: string, experienceData: IExperience): Promise<IUser>;
    deleteUserExperience(userId: string, experienceId: string): Promise<IUser>;
    fetchActivity(userId:string):Promise<any>;
}