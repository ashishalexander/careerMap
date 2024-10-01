// src/models/otp.model.ts
import { Schema, model, Document } from 'mongoose';

// OTP interface for type safety
export interface IOtp extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
}

const otpSchema = new Schema<IOtp>({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

// Create a TTL index on the expiresAt field with expiration time of 30 seconds
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 30 });

export const OtpModel = model<IOtp>('Otp', otpSchema);
