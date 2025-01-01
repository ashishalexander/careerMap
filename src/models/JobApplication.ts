// models/JobApplication.ts
import mongoose, { Schema, Document } from 'mongoose';

interface IEducation {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

interface IExperience {
  company?: string;
  position?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface IJobApplication extends Document {
  fullName: string;
  email: string;
  phone: string;
  coverLetter?: string;
  education: IEducation[];
  experience?: IExperience[];
  resumeUrl: string; 
  userId:mongoose.Types.ObjectId;
  customAnswers?: Record<string, string>;
  jobId: mongoose.Types.ObjectId; 
  status: "pending" | "approved" | "rejected"; 
  appliedAt?: Date; 
  updatedAt: Date;
}

const EducationSchema = new Schema<IEducation>({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  field: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String },
  current: { type: Boolean, default: false },
  description: { type: String },
});

const ExperienceSchema = new Schema<IExperience>({
  company: { type: String },
  position: { type: String },
  location: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  current: { type: Boolean, default: false },
  description: { type: String },
});

const JobApplicationSchema = new Schema<IJobApplication>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    coverLetter: { type: String },
    education: { type: [EducationSchema], required: true },
    experience: { type: [ExperienceSchema], default: [] },
    resumeUrl: { type: String, required: true },
    customAnswers: { type: Map, of: String },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    userId:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }, 
    appliedAt: { type: Date, default: Date.now }, // Added appliedAt field with default value

  },
  { timestamps: true }
);

export default mongoose.model<IJobApplication>('JobApplication', JobApplicationSchema);
