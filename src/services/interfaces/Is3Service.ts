import { IUser } from "../../models/userModel";

export interface Is3Service{
    uploadProfilePicture(avatarImageUrl:string,userId:string): Promise<IUser>;
    removeProfilePicture(userId:string): Promise<void>;
    uploadBannerPicture(userId:string,bannerImageUrl:string): Promise<IUser>
}