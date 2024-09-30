// src/repositories/interfaces/user.repository.interface.ts
import { IUser } from '../../models/userModel';

export interface IUserRepository {
  findUserByEmail(email: string): Promise<IUser | null>;
  createUser(userData: Partial<IUser>): Promise<IUser>;
}
