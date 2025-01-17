import { IUser } from "../../models/userModel"
export interface IExperience {
    title: string;
    employmentType: string;
    company: string;
    startDate: Date | null;
    endDate: Date | null;
    location: string;
    description: string;
  }
export interface IExperienceInput extends IExperience{
    _id:string
}
export interface IUserProfileService{
    updateUserProfile(userId: string, updateData: Partial<IUser>): Promise<IUser>;
    updateUserAbout(userId: string, about: string): Promise<IUser>;
    updateUserEducation(userId: string, Education: Partial<IUser>): Promise<IUser>; 
    editUserEducation(userId:string,Education:Partial<IUser>,EducationId:string):Promise<IUser>
    deleteUserEducation(userId: string, educationId: string): Promise<IUser>;
    updateUserExperience(userId: string, editingIndex: string, experienceData: IExperience): Promise<IUser>;
    addUserExperience(userId: string, experienceData: IExperience): Promise<IUser>;
    deleteUserExperience(userId: string, experienceId: string): Promise<IUser>;
    fetchActivity(userId:string):Promise<any>;
    recruiterJobPosts(userId:string):Promise<any>
    getUserProfile(userId: string): Promise<IUser>
}