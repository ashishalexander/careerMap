import { IUserCreate, IUser } from '../../models/userModel';

export interface IUserService {
  completeSignup(userDetails: IUserCreate): Promise<IUser>;
  OauthCreateUser(userDetails: IUserCreate): Promise<IUser>;
  findUserByEmail(email:string): Promise<IUser| null>
  getSubscriptionDetails(userId: string):Promise<any>
}
