import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IJob extends Document {
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
  salary?: string;
  contactEmail: string;
  recruiter: Types.ObjectId; // Reference to User
  createdAt: Date;
  updatedAt: Date;
  customQuestions?: Array<{
    question: string;  
    type: string;      
    options?: string[]; 
  }>;
}

const JobSchema: Schema = new Schema<IJob>(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    type: { type: String, enum: ['Full-time', 'Part-time', 'Contract'], required: true },
    description: { type: String, required: true },
    requirements: { type: String, required: true },
    salary: { type: String },
    contactEmail: { type: String},
    recruiter: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // User reference
    customQuestions: [
      {
        question: { type: String, required: true },
        type: { type: String, enum: ['text', 'multiple-choice'], required: true },
        options: { type: [String] },  
      },
    ],
  },
  { timestamps: true }
);

export const JobModel = mongoose.model<IJob>('Job', JobSchema);
