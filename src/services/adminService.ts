import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CustomError } from '../errors/customErrors';
import { AdminDocument } from '../models/adminModel';
import { AdminRepository } from '../repositories/adminRepository';
import { generateAccessToken, generateRefreshToken } from '../utils/tokenUtils';
import { IUser } from '../models/userModel';
import { IAdminRepository } from '../repositories/interfaces/adminRepository';
import {IAdminService} from '../services/interfaces/IAdminService'
import { HttpStatusCodes } from '../config/HttpStatusCodes'; 

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

    public async fetchAllUsers(): Promise<IUser[]> {
        try {
            const users = await this.adminRepository.findAllUsers();
            if (users.length === 0) {
                throw new CustomError('No users found', HttpStatusCodes.NOT_FOUND);
            }
            return users;
        } catch (error:any) {
            throw new CustomError(`Error fetching users: ${error.message}`, HttpStatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

