// models/reportModel.ts
import mongoose, { Schema, Document } from 'mongoose';
import { ReportType, ReportTimeframe, ReportFormat } from '../interfaces/reports';

export interface IReport extends Document {
  _id:string;
  filename: string;
  downloadUrl: string;
  createdAt: Date;
  reportType: ReportType;
  timeframe: ReportTimeframe;
  format: ReportFormat;
  startDate?: Date;
  endDate?: Date;
  userId: mongoose.Types.ObjectId;
  s3Key: string;
}

const ReportSchema: Schema = new Schema<IReport>(
  {
    filename: { type: String, required: true },
    downloadUrl: { type: String, required: true },
    reportType: { 
      type: String, 
      enum: ['userGrowth', 'jobMarket', 'networkActivity', 'applicationStats', 'revenue'],
      required: true 
    },
    timeframe: { 
      type: String, 
      enum: ['lastWeek', 'lastMonth', 'lastQuarter', 'ytd', 'custom'],
      required: true 
    },
    format: { 
      type: String, 
      enum: ['csv', 'pdf', 'excel'],
      required: true 
    },
    startDate: { type: Date },
    endDate: { type: Date },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const ReportModel = mongoose.model<IReport>('Report', ReportSchema);