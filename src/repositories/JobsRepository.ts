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
   * Fetch jobs posted by a specific recruiter
   * @param recruiterId - Recruiter's user ID
   * @param skip - Number of documents to skip for pagination
   * @param limit - Maximum number of documents to fetch
   * @returns Array of job documents
   */
  async getJobsByRecruiter(
    recruiterId: string,
    skip: number,
    limit: number
  ): Promise<IJob[]> {
    try {
      return await JobModel.find({ recruiter: new mongoose.Types.ObjectId(recruiterId) })
        .sort({ createdAt: -1 }) // Sort by newest jobs first
        .skip(skip)
        .limit(limit)
        .lean();
    } catch (error: any) {
      console.error("Error in JobRepository (getJobsByRecruiter):", error.message);
      throw new CustomError(
        "Failed to fetch jobs by recruiter",
        HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Fetch all jobs
   * @param skip - Number of documents to skip for pagination
   * @param limit - Maximum number of documents to fetch
   * @returns Array of job documents
   */
  async getAllJobs(skip: number, limit: number): Promise<IJob[]> {
    try {
      return await JobModel.find()
        .sort({ createdAt: -1 }) // Sort by newest jobs first
        .skip(skip)
        .limit(limit)
        .populate("recruiter", "firstName lastName companyName") // Populate recruiter details
        .lean();
    } catch (error: any) {
      console.error("Error in JobRepository (getAllJobs):", error.message);
      throw new CustomError(
        "Failed to fetch all jobs",
        HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}
