import { IPost } from "../../models/mediaModel";

export interface IUserMediaRepository {
  create(postData: Partial<IPost>): Promise<any>;
  getUserConnections(userId: string): Promise<string[]>;
  getPostsByConnections(connections: string[],skip: number,limit: number): Promise<any[]>;
}
