import AdminModel, { AdminDocument } from '../models/adminModel';
import { CustomError } from '../errors/customErrors';
import { UserModel, IUser } from '../models/userModel';  
import { IAdminRepository } from './interfaces/adminRepository';
import { HttpStatusCodes } from '../config/HttpStatusCodes';

export class AdminRepository implements IAdminRepository {
    public async findByEmail(email: string): Promise<AdminDocument | null> {
        try {
            const admin = await AdminModel.findOne({ email }).exec();
            if (!admin) {
                throw new CustomError('Admin not found', HttpStatusCodes.NOT_FOUND); 
            }
            return admin;
        } catch (error) {
            throw new CustomError(`Error finding admin by email: ${error}`, HttpStatusCodes.INTERNAL_SERVER_ERROR); 
        }
    }

    public async findById(id: string): Promise<AdminDocument | null> {
        try {
            const admin = await AdminModel.findById(id).exec();
            if (!admin) {
                throw new CustomError('Admin not found',  HttpStatusCodes.NOT_FOUND); 
            }
            return admin;
        } catch (error) {
            throw new CustomError(`Error finding admin by ID: ${error}`, HttpStatusCodes.INTERNAL_SERVER_ERROR); 
        }
    }
    public async findAllUsers(): Promise<IUser[]> {
        try {
            const users = await UserModel.find({}).exec(); // Fetch all users
            if (users.length === 0) {
                throw new CustomError('No users found', HttpStatusCodes.NOT_FOUND); 
            }
            return users;
        } catch (error:any) {
            throw new CustomError(`Error fetching users: ${error.message}`, HttpStatusCodes.INTERNAL_SERVER_ERROR); 
        }
    }

    public async findUserById(userId: string): Promise<IUser | null> {
        try {
            const user = await UserModel.findById(userId).exec();
            if (!user) {
                throw new CustomError('User not found', HttpStatusCodes.NOT_FOUND);
            }
            return user;
        } catch (error:any) {
            throw new CustomError(`Error finding user by ID: ${error.message}`, HttpStatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}
