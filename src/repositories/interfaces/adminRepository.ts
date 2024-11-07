import {AdminDocument} from '../../models/adminModel'
import { IUser } from '../../models/userModel';
import { IBaseRepository } from './IBaseRepository';
export interface IAdminRepository extends IBaseRepository<AdminDocument>{
    findByEmail(email:string): Promise<AdminDocument | null>;
    findById(id:string): Promise<AdminDocument | null>;
    findAllUsers(): Promise<IUser[]>;
    findUserById(userId:string): Promise<IUser | null>
}