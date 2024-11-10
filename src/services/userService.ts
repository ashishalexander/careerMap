// src/services/userService.ts
import bcrypt from 'bcryptjs';
import { IUser, IUserCreate } from '../models/userModel';
import { UserRepository } from '../repositories/userRepository';
import { CustomError } from "../errors/customErrors";
import { IUserService } from './interfaces/IUserService';
import { IUserRepository } from '../repositories/interfaces/userRepository';
import { HttpStatusCodes } from '../config/HttpStatusCodes'; 

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}
  /**
   * Finds a user by their email address.
   * 
   * @param email - The email address of the user to be found.
   * @returns A Promise that resolves to the found user, or null if not found.
   * @throws Error if there is an issue during the search process.
   */
  async findUserByEmail(email: string): Promise<IUser | null> {
    try {
      return await this.userRepository.findUserByEmail(email);
    } catch (error) {
      console.error(`Error in UserService while finding user by email: ${email}`, error);
      throw new CustomError('Failed to find user by email',HttpStatusCodes.INTERNAL_SERVER_ERROR); 
    }
  }
   /**
   * Completes the user signup process.
   * 
   * @param userDetails - The details of the user to be registered.
   * @returns A Promise that resolves to the newly created user.
   * @throws Error if there is an issue during the registration process.
   */
  async completeSignup(userDetails: IUserCreate): Promise<IUser> {
    try {
      const saltRounds = 10;
      if(userDetails.password) userDetails.password = await bcrypt.hash(userDetails.password, saltRounds);
      const newUser = await this.userRepository.createUser(userDetails);
      return newUser;
    } catch (error) {
      console.error('Error in UserService while creating user:', error);
      throw new CustomError('User registration failed', HttpStatusCodes.INTERNAL_SERVER_ERROR); 
    }
  }
  /**
   * Creates a new user using OAuth information.
   * 
   * @param userDetails - The details of the user to be created.
   * @returns A Promise that resolves to the newly created user.
   * @throws Error if there is an issue during the user creation process.
   */
  async OauthCreateUser(userDetails:IUserCreate):Promise<IUser|any>{
    try {
      const newUser = await this.userRepository.createUser(userDetails)
      return newUser
    } catch (error) {
      console.error('Error in Oauthcreateuser:', error);
      throw new CustomError('OAuth user registration failed', HttpStatusCodes.INTERNAL_SERVER_ERROR); 

    }
  }
}
