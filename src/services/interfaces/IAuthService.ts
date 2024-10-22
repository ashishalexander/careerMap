import { IUser } from "../../models/userModel";
export interface IAuthService {
  signIn(
    email: string,
    password: string
  ): Promise<{ accessToken: string; refreshToken: string }>;
}

export interface ITokenService {
  generateAccessToken(user: IUser): string;
  generateRefreshToken(user: IUser): string;
}


