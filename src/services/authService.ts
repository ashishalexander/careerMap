import bcrypt from 'bcryptjs';
import { IUser } from '../models/userModel';
import { CustomError } from '../errors/customErrors';
import { generateAccessToken, generateRefreshToken } from '../utils/tokenUtils';
import { IUserRepository } from '../repositories/interfaces/userRepository';
import {IAuthService} from '../services/interfaces/IAuthService';
import { HttpStatusCodes } from '../config/HttpStatusCodes'; 


export class AuthService implements IAuthService {

  constructor(private userRepository : IUserRepository) {

  }
  /**
   * Signs in a user with their email and password.
   * 
   * @param email - The email address of the user attempting to sign in.
   * @param password - The password provided by the user.
   * @returns A Promise that resolves to the JWT token if authentication is successful.
   * @throws Error if the credentials are invalid or if any error occurs during the process.
   */
  async signIn(email: string, password: string): Promise<{ accessToken: string, refreshToken: string,user:IUser }> {
    const user: IUser | null = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new CustomError('Invalid credentials', HttpStatusCodes.UNAUTHORIZED);    }
    if(user.isblocked){
      throw new CustomError("User is blocked by the administrator",HttpStatusCodes.USER_BLOCKED)
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new CustomError('Invalid credentials', HttpStatusCodes.UNAUTHORIZED); 
    }
    const accessToken = generateAccessToken(user);
    const refreshToken =generateRefreshToken(user);
    
    return { accessToken, refreshToken,user };
  }
}
