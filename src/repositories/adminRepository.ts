import AdminModel, { AdminDocument } from '../models/adminModel';
import { CustomError } from '../errors/customErrors';

export class AdminRepository {
    public async findByEmail(email: string): Promise<AdminDocument | null> {
        try {
            const admin = await AdminModel.findOne({ email:"ashishalex29@gmail.com" }).exec();
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
}
