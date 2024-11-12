export interface Is3Service{
    uploadProfilePicture(file:any,userId:string): Promise<string>;
    removeProfilePicture(userId:string): Promise<void>;
    uploadBannerPicture(userId:string,file:File): Promise<string>
}