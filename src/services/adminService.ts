import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CustomError } from '../errors/customErrors';
import { AdminDocument } from '../models/adminModel';
import { AdminRepository } from '../repositories/adminRepository';
import { generateAccessToken, generateRefreshToken } from '../utils/tokenUtils';


export class AdminService {
    constructor(private adminRepository: AdminRepository) {}

    async authenticate(email: string, password: string): Promise<{ admin: AdminDocument, accessToken: string, refreshToken: string }> {
        const admin  = await this.adminRepository.findByEmail(email);
        if (!admin) {
            throw new CustomError('Invalid email or password', 401);
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            throw new CustomError('Invalid email or password', 401);
        }

        // const jwtSecret = process.env.JWT_SECRET;
        // if (!jwtSecret) {
        //     throw new CustomError('JWT_SECRET is not defined in the environment variables', 500); 
        // }
        // // Generate JWT token
        // const token = jwt.sign({ id: admin._id, email: admin.email }, jwtSecret, { expiresIn: '1h' });
        const accessToken = generateAccessToken(admin);
        const refreshToken = generateRefreshToken(admin);

        return { admin, accessToken,refreshToken };
    }
}

