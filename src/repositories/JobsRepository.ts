import { IJobRepository } from "./interfaces/IJobRepository";
import { JobModel } from "../models/JobsModel";
import { IJob } from "../models/JobsModel";
import { CustomError } from "../errors/customErrors";
import { HttpStatusCodes } from "../config/HttpStatusCodes";
import mongoose from "mongoose";

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

  
}
