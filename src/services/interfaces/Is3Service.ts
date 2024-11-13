import { IUser } from "../../models/userModel";

export interface Is3Service{
    uploadProfilePicture(file:any,userId:string): Promise<string>;
    removeProfilePicture(userId:string): Promise<void>;
    uploadBannerPicture(userId:string,bannerImageUrl:string): Promise<IUser>
}