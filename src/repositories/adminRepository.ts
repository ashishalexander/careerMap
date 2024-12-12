import AdminModel, { AdminDocument } from '../models/adminModel';
import { CustomError } from '../errors/customErrors';
import { UserModel, IUser } from '../models/userModel';  
import { IAdminRepository } from './interfaces/adminRepository';
import { HttpStatusCodes } from '../config/HttpStatusCodes';
import { BaseRepository } from './baseRepository';
import { PaginatedResponse, QueryParams } from '../interfaces/listingPage';

export class AdminRepository extends BaseRepository<AdminDocument> implements IAdminRepository {
    constructor(){
        super(AdminModel)
    }

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
    public async findAllUsers(queryParams: QueryParams): Promise<PaginatedResponse> {
        try {
          const { page = 1, limit = 10, search = '', sortBy = 'firstName', sortOrder = 'asc' } = queryParams;
          
          // Build search query
          const searchQuery = search
            ? {
                $or: [
                  { firstName: { $regex: search, $options: 'i' } },
                  { email: { $regex: search, $options: 'i' } }
                ]
              }
            : {};
    
          // Calculate skip value for pagination
          const skip = (page - 1) * limit;
    
          // Build sort object
          const sortObject: { [key: string]: 1 | -1 } = {
            [sortBy]: sortOrder === 'asc' ? 1 : -1
          };
    
          // Execute queries
          const [users, total] = await Promise.all([
            UserModel.find(searchQuery)
              .sort(sortObject)
              .skip(skip)
              .limit(limit)
              .exec(),
            UserModel.countDocuments(searchQuery)
          ]);
    
          if (users.length === 0 && page !== 1) {
            throw new CustomError('No users found for this page', HttpStatusCodes.NOT_FOUND);
          }
    
          return {
            data: users,
            total,
            page,
            totalPages: Math.ceil(total / limit)
          };
        } catch (error: any) {
          throw new CustomError(
            `Error fetching users: ${error.message}`,
            HttpStatusCodes.INTERNAL_SERVER_ERROR
          );
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
