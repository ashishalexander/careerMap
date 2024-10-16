import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/userRepository';
import { IUser } from '../models/userModel';
import { CustomError } from '../errors/customErrors';
import { generateAccessToken, generateRefreshToken } from '../utils/tokenUtils';


export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
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
    // const jwtSecret = process.env.JWT_SECRET;
    // if (!jwtSecret) {
    //   throw new CustomError('JWT_SECRET is not defined in the environment variables', 500);    }
    // const token = jwt.sign(
    //   { userId: user._id, email: user.email, role: user.role },
    //   jwtSecret,
    //   { expiresIn: '1h' }
    // );
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    return { accessToken, refreshToken };
  }
}
