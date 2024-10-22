import {AdminDocument} from '../../models/adminModel'
import { IUser } from '../../models/userModel';
export interface IAdminRepository{
    findByEmail(email:string): Promise<AdminDocument | null>;
    findById(id:string): Promise<AdminDocument | null>;
    findAllUsers(): Promise<IUser[]>
}