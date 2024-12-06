import { IPost } from "../../models/mediaModel"
export interface IUserMediaService{
    createPost(userId: string, newPost: Partial<IPost>): Promise<any>
}