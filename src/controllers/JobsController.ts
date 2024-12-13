import { NextFunction, Request, Response } from 'express';
import { IJobService } from '../services/interfaces/IJobsService';
import { CustomError } from '../errors/customErrors';
import { HttpStatusCodes } from '../config/HttpStatusCodes';

export class JobController {
  private jobService: IJobService;

  constructor(jobService: IJobService) {
    this.jobService = jobService;
  }

  async createJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const jobData = req.body;
      console.log(jobData)

      if (!userId) {
        throw new CustomError('User ID is required', HttpStatusCodes.BAD_REQUEST);
      }

      const createdJob = await this.jobService.createJob(userId, jobData);

      res.status(HttpStatusCodes.CREATED).json({
        message: 'Job created successfully',
        data: createdJob,
      });
    } catch (error: any) {
      console.error('Error creating job:', error.message);
      next(
        new CustomError(
          error.message || 'Internal Server Error',
          error.status || HttpStatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    }
  }

// Fetch jobs with pagination
async fetchAllJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10 } = req.query;
  
      if (!userId) {
        throw new CustomError('User ID is required', HttpStatusCodes.BAD_REQUEST);
      }
  
      // Fetch jobs from the job service
      const { jobs, totalJobs, currentPage, totalPages } = await this.jobService.fetchAllJobs(+page, +limit);
  
      // Check if jobs were fetched successfully
      if (!jobs || jobs.length === 0) {
        throw new CustomError('No jobs found', HttpStatusCodes.NOT_FOUND);
      }
  
      res.status(HttpStatusCodes.OK).json({
        message: 'Jobs fetched successfully',
        data: {
          jobs,
          currentPage,
          totalPages,
          totalJobs, // Include totalJobs for reference
        },
      });
    } catch (error: any) {
      console.error('Error fetching jobs:', error.message);
      next(
        new CustomError(
          error.message || 'Internal Server Error',
          error.status || HttpStatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    }
  }
}
