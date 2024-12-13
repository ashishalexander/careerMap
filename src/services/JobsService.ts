import { IJobService } from "./interfaces/IJobsService";
import { IJobRepository } from "../repositories/interfaces/IJobRepository";
import { IJob } from "../models/JobsModel";
import { CustomError } from "../errors/customErrors";
import { HttpStatusCodes } from "../config/HttpStatusCodes";
import { Types } from "mongoose";

export class JobService implements IJobService {
  private jobRepository: IJobRepository;

  constructor(jobRepository: IJobRepository) {
    this.jobRepository = jobRepository;
  }

  async createJob(userId: string, newJob: Partial<IJob>): Promise<any> {
    // Validate required fields
    if (!newJob.title || !newJob.description ||!newJob.company ||!newJob.location||!newJob.requirements||!newJob.recruiter||!newJob.type) {
      throw new CustomError(
        "Job must have proper details",
        HttpStatusCodes.BAD_REQUEST
      );
    }

    const job = {
      recruiter: new Types.ObjectId(userId),
      company: newJob.company,
      title: newJob.title.trim(),
      description: newJob.description.trim(),
      location: newJob.location?.trim(),
      salary:newJob.salary||undefined,
      type: newJob.type,
      requirements:newJob.requirements,
      contactEmail:newJob.contactEmail,
      createdAt: new Date(),
    };

    try {
      // Save job to the repository
      const createdJob = await this.jobRepository.create(job);
      return createdJob;
    } catch (error: any) {
      console.error("Error creating job:", error.message);
      throw new CustomError(
        "Failed to create job",
        HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async fetchJobs(userId: string, page: number, limit: number): Promise<any> {
    const skip = (page - 1) * limit;

    try {
      // Fetch jobs posted by the recruiter
      const jobs = await this.jobRepository.getJobsByRecruiter(userId, skip, limit);

      return {
        jobs,
        currentPage: page,
        nextPage: jobs.length === limit ? page + 1 : null,
      };
    } catch (error: any) {
      console.error("Error fetching jobs:", error.message);
      throw new CustomError(
        "Failed to fetch jobs",
        HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async fetchAllJobs(page: number, limit: number): Promise<any> {
    const skip = (page - 1) * limit;

    try {
      // Fetch all jobs (e.g., for job seekers)
      const jobs = await this.jobRepository.getAllJobs(skip, limit);

      return {
        jobs,
        currentPage: page,
        nextPage: jobs.length === limit ? page + 1 : null,
      };
    } catch (error: any) {
      console.error("Error fetching all jobs:", error.message);
      throw new CustomError(
        "Failed to fetch jobs",
        HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}
