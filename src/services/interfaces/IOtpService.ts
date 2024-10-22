export interface IOtpService {
    createOtpEntry(email: string): Promise<void>;
    sendOtpEmail(email:string,opt:string): Promise<void>
    verifyOtp(email: string, otp: string): Promise<boolean>;
  }
  