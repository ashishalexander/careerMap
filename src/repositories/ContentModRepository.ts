import mongoose from 'mongoose';
import ContentModSchema, { IContentMod } from '../models/contentModerationModel';
import { IContentModRepository,FilterOptions } from './interfaces/IContentModRepository';
import { CustomError } from '../errors/customErrors';
import { HttpStatusCodes } from '../config/HttpStatusCodes';



export class ContentModRepository implements IContentModRepository {
  async create(reportData: Partial<IContentMod>): Promise<IContentMod> {
    try {
      const report = await ContentModSchema.create(reportData);
      return report;
    } catch (error: any) {
      if (error.code === 11000) { // Duplicate key error
        throw new CustomError(
          'You have already reported this post',
          HttpStatusCodes.CONFLICT
        );
      }
      throw new CustomError(
        'Failed to create report',
        HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getReports(filters: FilterOptions): Promise<{ reports: IContentMod[]; total: number }> {
    try {
      const { status, page = 1, limit = 10 } = filters;
      const skip = (page - 1) * limit;

      // Build query based on filters
      const query: any = {};
      if (status && status !== 'all') {
        query.status = status;
      }

      // Execute queries in parallel
      const [reports, total] = await Promise.all([
        ContentModSchema.find(query)
          .populate('postId', 'text media')
          .populate('reportedBy', 'username')
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        ContentModSchema.countDocuments(query)
      ]);

      return { reports, total };
    } catch (error) {
      throw new CustomError(
        'Failed to fetch reports',
        HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }


  async updateReportStatus(
    reportId: string,
    status: string,
    response: string
  ): Promise<IContentMod> {
    try {
      const report = await ContentModSchema.findByIdAndUpdate(
        reportId,
        {
          status,
          reviewedAt: new Date(),
          adminResponse: response
        },
        { new: true }
      ).populate('postId');

      if (!report) {
        throw new CustomError('Report not found', HttpStatusCodes.NOT_FOUND);
      }

      return report;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        'Failed to update report status',
        HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

}