import { IJobRepository } from "./interfaces/IJobRepository";
import { JobModel } from "../models/JobsModel";
import { IJob } from "../models/JobsModel";
import { CustomError } from "../errors/customErrors";
import { HttpStatusCodes } from "../config/HttpStatusCodes";

export class JobRepository implements IJobRepository {
  /**
   * Create a new job in the database
   * @param job - Partial job object containing title, description, etc.
   * @returns The created job document
   */
  async create(job: Partial<IJob>): Promise<IJob> {
    try {
      const createdJob = await JobModel.create(job);
      return createdJob;
    } catch (error: any) {
      console.error("Error in JobRepository:", error.message);
      throw new CustomError(
        "Failed to create job",
        HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

   /**
   * Fetch all jobs with pagination
   * @param skip - The number of jobs to skip (for pagination)
   * @param limit - The number of jobs to limit the result to (for pagination)
   * @returns An array of jobs
   */
   async getAllJobs(skip: number, limit: number): Promise<IJob[]> {
    try {
      // Fetch jobs with pagination (skip and limit)
      const jobs = await JobModel.find().skip(skip).limit(limit).exec();
      return jobs;
    } catch (error: any) {
      console.error("Error fetching jobs:", error.message);
      throw new CustomError(
        "Failed to fetch jobs",
        HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // JobRepository.ts
/**
 * Find a job by ID
 * @param postId - The ID of the job to find
 * @returns The job document
 */
async findById(postId: string): Promise<IJob | null> {
  try {
    const job = await JobModel.findById(postId).exec();
    return job;
  } catch (error: any) {
    console.error('Error finding job:', error.message);
    throw new CustomError(
      'Failed to find job',
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * Delete a job by ID
 * @param postId - The ID of the job to delete
 */
async delete(postId: string): Promise<void> {
  try {
    await JobModel.findByIdAndDelete(postId).exec();
  } catch (error: any) {
    console.error('Error deleting job:', error.message);
    throw new CustomError(
      'Failed to delete job',
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async update(jobId: string, updatedData: Partial<IJob>): Promise<IJob | null> {
  try {
    const updatedJob = await JobModel.findByIdAndUpdate(
      jobId,
      { $set: updatedData }, // Update specific fields
      { new: true, runValidators: true } // Return the updated document and run validations
    ).exec();

    return updatedJob;
  } catch (error: any) {
    console.error('Error updating job:', error.message);
    throw new CustomError(
      'Failed to update job',
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
} 
}
