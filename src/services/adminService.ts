import bcrypt from 'bcryptjs';
import { CustomError } from '../errors/customErrors';
import { AdminDocument } from '../models/adminModel';
import { generateAccessToken, generateRefreshToken } from '../utils/tokenUtils';
import { IAdminRepository } from '../repositories/interfaces/adminRepository';
import {IAdminService} from '../services/interfaces/IAdminService'
import { HttpStatusCodes } from '../config/HttpStatusCodes'; 
import {PaginatedResponse,QueryParams} from '../interfaces/listingPage'

export class AdminService implements IAdminService {
    constructor(private adminRepository: IAdminRepository) {}

    async authenticate(email: string, password: string): Promise<{ admin: AdminDocument, accessToken: string, refreshToken: string }> {
        const admin  = await this.adminRepository.findByEmail(email);
        if (!admin) {
            throw new CustomError('Invalid email or password', HttpStatusCodes.UNAUTHORIZED);
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            throw new CustomError('Invalid email or password', HttpStatusCodes.UNAUTHORIZED);
        }

        const accessToken = generateAccessToken(admin);
        const refreshToken = generateRefreshToken(admin);

        return { admin, accessToken,refreshToken };
    }

    public async fetchAllUsers(queryParams: QueryParams): Promise<PaginatedResponse> {
        try {
          const result = await this.adminRepository.findAllUsers(queryParams);
          if (!result.data.length) {
            throw new CustomError('No users found', HttpStatusCodes.NOT_FOUND);
          }
          return result;
        } catch (error: any) {
          throw new CustomError(
            `Error fetching users: ${error.message}`,
            HttpStatusCodes.INTERNAL_SERVER_ERROR
          );
        }
      }


    public async blockUser(userId: string): Promise<void> {
        try {
            const user= await this.adminRepository.findUserById(userId);
            if (!user) {
                throw new CustomError('User not found', HttpStatusCodes.NOT_FOUND);
            }
            user.isblocked = !user.isblocked; 
            await user.save();

        } catch (error: any) {
            throw new CustomError(`Error blocking user: ${error.message}`, HttpStatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

