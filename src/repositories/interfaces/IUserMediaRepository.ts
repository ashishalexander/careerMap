import { IPost } from "../../models/mediaModel";

export interface IUserMediaRepository{
    create(postData: Partial<IPost>): Promise<any> 
}