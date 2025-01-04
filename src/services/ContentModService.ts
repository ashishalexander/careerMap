import { IContentModService,ReportFilters } from './interfaces/IContentModService';
import { IContentModRepository } from '../repositories/interfaces/IContentModRepository';
import { IContentMod } from '../models/contentModerationModel';
import { CustomError } from '../errors/customErrors';
import { HttpStatusCodes } from '../config/HttpStatusCodes';
import { Types } from 'mongoose';


export class ContentModService implements IContentModService {
    private ContentModRepository: IContentModRepository;
  
    constructor(ContentModRepository: IContentModRepository) {
      this.ContentModRepository = ContentModRepository;
    }
  
    async createReport(
      postId: string,
      userId: string,
      reason: string,
      details?: string
    ): Promise<IContentMod> {
      if (!Types.ObjectId.isValid(postId) || !Types.ObjectId.isValid(userId)) {
        throw new CustomError('Invalid post or user ID', HttpStatusCodes.BAD_REQUEST);
      }
  
      const reportData: Partial<IContentMod> = {
        postId: new Types.ObjectId(postId),
        reportedBy: new Types.ObjectId(userId),
        reason,
        details,
        timestamp: new Date()
      };
  
      const report = await this.ContentModRepository.create(reportData);
      
      return report;
    }

    async getReports(filters: ReportFilters):Promise<any> {
        // Validate page and limit
        const page = Math.max(1, filters.page || 1);
        const limit = Math.min(50, Math.max(1, filters.limit || 10));
    
        const { reports, total } = await this.ContentModRepository.getReports({
          status: filters.status,
          page,
          limit
        });
    
        return {
          data: reports,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        };
      }

      async handleReportAction(
        reportId: string,
        action: string,
        response: string
      ): Promise<IContentMod> {
        if (!Types.ObjectId.isValid(reportId) ) {
          throw new CustomError('Invalid report or admin ID', HttpStatusCodes.BAD_REQUEST);
        }
    
        let status: string;
        switch (action) {
          case 'REMOVE_POST':
            status = 'action_taken';
            break;
          case 'WARNING':
            status = 'reviewed';
            break;
          case 'IGNORE':
            status = 'ignored';
            break;
          default:
            throw new CustomError('Invalid action', HttpStatusCodes.BAD_REQUEST);
        }
    
        return this.ContentModRepository.updateReportStatus(reportId, status, response);
      }
    
}