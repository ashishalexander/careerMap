import mongoose from "mongoose";
import JobApplicationModel, { IJobApplication } from "../models/JobApplication";
import { CustomError } from "../errors/customErrors";
import { HttpStatusCodes } from "../config/HttpStatusCodes";
import { IJobApplicationRepository } from "./interfaces/IJobApplicationRepository";
import { IJob, JobModel } from "../models/JobsModel";

export class JobApplicationRepository implements IJobApplicationRepository {
    /**
     * Create a new job application in the database
     * @param application - Partial job application object
     * @returns The created job application document
     */
    async create(application: Partial<IJobApplication>): Promise<IJobApplication> {
      try {
        const createdApplication = await JobApplicationModel.create(application);
        return createdApplication;
      } catch (error: any) {
        console.error("Error in JobApplicationRepository (create):", error.message);
        throw new CustomError(
          "Failed to create job application",
          HttpStatusCodes.INTERNAL_SERVER_ERROR
        );
      }
    }

     /**
     * Find a job application by user ID and job ID
     * @param userId - The ID of the user
     * @param jobId - The ID of the job
     * @returns The found job application or null
     */
     async findByUserIdAndJobId(userId: string, jobId: string): Promise<IJobApplication | null> {
      try {
          const application = await JobApplicationModel.findOne({ userId, jobId });
          return application;
      } catch (error: any) {
          console.error("Error in JobApplicationRepository (findByUserIdAndJobId):", error.message);
          throw new CustomError(
              "Failed to find job application",
              HttpStatusCodes.INTERNAL_SERVER_ERROR
          );
      }
  }

  async findByJobId(jobId: string, page: number = 1, limit: number = 10): Promise<{ applications: IJobApplication[], total: number }> {
    try {
        const skip = (page - 1) * limit;
        const applications = await JobApplicationModel.find({ jobId })
            .populate('userId', 'fullName email')
            .sort({ appliedAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await JobApplicationModel.countDocuments({ jobId });

        return { applications, total };
    } catch (error: any) {
        throw new CustomError(
            "Failed to fetch job applications",
            HttpStatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

  async findByRecruiterId(recruiterId: string): Promise<IJob[]> {
    try {
        return await JobModel.find({ 
            recruiter:recruiterId,
        }).sort({ createdAt: -1 });
    } catch (error: any) {
        throw new CustomError(
            'Failed to fetch recruiter jobs',
            HttpStatusCodes.INTERNAL_SERVER_ERROR
        );
    }
  }


}