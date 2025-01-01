import mongoose from "mongoose";
import JobApplicationModel, { IJobApplication } from "../models/JobApplication";
import { CustomError } from "../errors/customErrors";
import { HttpStatusCodes } from "../config/HttpStatusCodes";
import { IJobApplicationRepository } from "./interfaces/IJobApplicationRepository";

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
}