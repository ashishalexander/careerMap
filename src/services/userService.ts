// src/services/userService.ts
import { IUser } from '../models/userModel';
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
  async completeSignup(userDetails: IUser): Promise<IUser> {
    try {
      // You may want to hash the password here before saving
      const newUser = await this.userRepository.createUser(userDetails);
      return newUser;
    } catch (error) {
      console.error('Error in UserService while creating user:', error);
      throw new Error('User registration failed'); // Propagate the error to the controller
    }
  }
}
