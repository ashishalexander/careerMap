// src/services/userService.ts
import bcrypt from 'bcryptjs';
import { IUser, IUserCreate } from '../models/userModel';
import { UserRepository } from '../repositories/userRepository';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  // Method to find a user by email
  async findUserByEmail(email: string): Promise<IUser | null> {
    try {
      return await this.userRepository.findUserByEmail(email);
    } catch (error) {
      console.error(`Error in UserService while finding user by email: ${email}`, error);
      throw new Error('Failed to find user by email'); // Propagate the error to the controller
    }
  }

  // Method to complete user signup
  async completeSignup(userDetails: IUserCreate): Promise<IUser> {
    try {
      const saltRounds = 10;
      userDetails.password = await bcrypt.hash(userDetails.password, saltRounds);
      const newUser = await this.userRepository.createUser(userDetails);
      return newUser;
    } catch (error) {
      console.error('Error in UserService while creating user:', error);
      throw new Error('User registration failed'); // Propagate the error to the controller
    }
  }
}
