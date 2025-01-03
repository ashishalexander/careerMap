import { NextFunction, Request, Response } from 'express';
import { IJobApplicationService } from '../services/interfaces/IJobApplicationService';
import { CustomError } from '../errors/customErrors';
import { HttpStatusCodes } from '../config/HttpStatusCodes';

export class JobApplicationController {
    private jobApplicationService: IJobApplicationService;
  
    constructor(jobApplicationService: IJobApplicationService) {
      this.jobApplicationService = jobApplicationService;
    }

    async applyForJob(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
          const { jobId, userId } = req.params;
          const applicationData = req.body;
    
          if (!jobId || !userId) {
            throw new CustomError('Job ID and User ID are required', HttpStatusCodes.BAD_REQUEST);
          }
          let resumeUrl: string |undefined;
          if (req.file) {
              const file = req.file as Express.MulterS3.File; // Explicitly cast req.file
              resumeUrl = file.location; // S3 file URL
              console.log(resumeUrl);
          }
          const application = await this.jobApplicationService.applyForJob(jobId, userId, {
            ...applicationData,
            resumeUrl,
        });

          res.status(HttpStatusCodes.CREATED).json({
            message: 'Application submitted successfully',
            data: application,
          });
        } catch (error: any) {
          console.error('Error applying for job:', error.message);
          next(
            new CustomError(
              error.message || 'Internal Server Error',
              error.status || HttpStatusCodes.INTERNAL_SERVER_ERROR
            )
          );
        }
      }

      async hasApplied(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { jobId, userId } = req.params;
    
            if (!jobId || !userId) {
                throw new CustomError('Job ID and User ID are required', HttpStatusCodes.BAD_REQUEST);
            }
    
            const existingApplication = await this.jobApplicationService.hasApplied(jobId, userId);
    
            res.status(HttpStatusCodes.OK).json({
                data: !!existingApplication,
            });
        } catch (error: any) {
            console.error('Error checking application status:', error.message);
            next(
                new CustomError(
                    error.message || 'Internal Server Error',
                    error.status || HttpStatusCodes.INTERNAL_SERVER_ERROR
                )
            );
        }
    }
}