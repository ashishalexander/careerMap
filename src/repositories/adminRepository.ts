import AdminModel, { AdminDocument } from '../models/adminModel';
import { CustomError } from '../errors/customErrors';
import { UserModel, IUser } from '../models/userModel';  
import { IAdminRepository } from './interfaces/adminRepository';

export class AdminRepository implements IAdminRepository {
    public async findByEmail(email: string): Promise<AdminDocument | null> {
        try {
            const admin = await AdminModel.findOne({ email }).exec();
            if (!admin) {
                throw new CustomError('Admin not found', 404); 
            }
            return admin;
        } catch (error) {
            throw new CustomError(`Error finding admin by email: ${error}`, 500); 
        }
    }

    public async findById(id: string): Promise<AdminDocument | null> {
        try {
            const admin = await AdminModel.findById(id).exec();
            if (!admin) {
                throw new CustomError('Admin not found', 404); 
            }
            return admin;
        } catch (error) {
            throw new CustomError(`Error finding admin by ID: ${error}`, 500); 
        }
    }
    public async findAllUsers(): Promise<IUser[]> {
        try {
            const users = await UserModel.find({}).exec(); // Fetch all users
            if (users.length === 0) {
                throw new CustomError('No users found', 404); 
            }
            return users;
        } catch (error:any) {
            throw new CustomError(`Error fetching users: ${error.message}`, 500); 
        }
    }
}
