import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/userRepository';
import { IUser } from '../models/userModel';
import { CustomError } from '../errors/customErrors';
import { generateAccessToken, generateRefreshToken } from '../utils/tokenUtils';
import { IUserRepository } from '../repositories/interfaces/userRepository';
import {IAuthService} from '../services/interfaces/IAuthService';
import { ITokenService } from '../services/interfaces/IAuthService';

export class AuthService implements IAuthService {

  constructor(private userRepository : IUserRepository,private tokenService:ITokenService) {
  }
  /**
   * Signs in a user with their email and password.
   * 
   * @param email - The email address of the user attempting to sign in.
   * @param password - The password provided by the user.
   * @returns A Promise that resolves to the JWT token if authentication is successful.
   * @throws Error if the credentials are invalid or if any error occurs during the process.
   */
  async signIn(email: string, password: string): Promise<{ accessToken: string, refreshToken: string }> {
    const user: IUser | null = await this.userRepository.findUserByEmail(email);
    if (!user||!user.password) {
      throw new CustomError('Invalid credentials', 401);    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new CustomError('Invalid credentials', 401); 
    }
    const accessToken = this.tokenService.generateAccessToken(user);
    const refreshToken = this.tokenService.generateRefreshToken(user);
    
    return { accessToken, refreshToken };
  }
}
