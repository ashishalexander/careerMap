import {IOtp} from '../../models/otpModel'

export interface IOtpRepository {
    createOtpEntry(email: string, otp: string, expiresAt: Date): Promise<IOtp>;
    findOtpByEmail(email: string): Promise<IOtp | null>;
}