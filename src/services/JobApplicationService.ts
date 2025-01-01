import { IJobApplicationService } from "./interfaces/IJobApplicationService";
import { IJobApplicationRepository } from "../repositories/interfaces/IJobApplicationRepository";
import { IJobApplication } from "../models/JobApplication";
import { CustomError } from "../errors/customErrors";
import { HttpStatusCodes } from "../config/HttpStatusCodes";
import { Types } from "mongoose";

export class JobApplicationService implements IJobApplicationService {
    private jobApplicationRepository: IJobApplicationRepository;

    constructor(jobApplicationRepository: IJobApplicationRepository) {
        this.jobApplicationRepository = jobApplicationRepository;
    }

    /**
     * Apply for a job
     * @param jobId - The ID of the job being applied for
     * @param userId - The ID of the user applying
     * @param applicationData - Partial application data
     * @returns The created job application
     */
    async applyForJob(jobId: string, userId: string, applicationData: Partial<IJobApplication>): Promise<IJobApplication> {
        console.log(applicationData)
        // Validate required fields
        if (!jobId || !Types.ObjectId.isValid(jobId)) {
            throw new CustomError("Invalid or missing Job ID", HttpStatusCodes.BAD_REQUEST);
        }

        if (!userId || !Types.ObjectId.isValid(userId)) {
            throw new CustomError("Invalid or missing User ID", HttpStatusCodes.BAD_REQUEST);
        }

        if (!applicationData.resumeUrl || typeof applicationData.resumeUrl !== "string") {
            throw new CustomError("A valid resume URL is required", HttpStatusCodes.BAD_REQUEST);
        }

        // Parse the education and experience fields from JSON string to array
        if (typeof applicationData.education === "string") {
            applicationData.education = JSON.parse(applicationData.education);
        }
        if (typeof applicationData.experience === "string") {
            applicationData.experience = JSON.parse(applicationData.experience);
        }

        if (typeof applicationData.customAnswers === "string") {
            applicationData.customAnswers = JSON.parse(applicationData.customAnswers);
        }

        if (!applicationData.education || !Array.isArray(applicationData.education) || applicationData.education.length === 0) {
            throw new CustomError("Education details are required", HttpStatusCodes.BAD_REQUEST);
        }

        if (!applicationData.experience || !Array.isArray(applicationData.experience)) {
            throw new CustomError("Experience details are required", HttpStatusCodes.BAD_REQUEST);
        }

        if (!applicationData.fullName || typeof applicationData.fullName !== "string") {
            throw new CustomError("Full name is required", HttpStatusCodes.BAD_REQUEST);
        }

        if (!applicationData.email || typeof applicationData.email !== "string") {
            throw new CustomError("Email is required", HttpStatusCodes.BAD_REQUEST);
        }

        if (!applicationData.phone || typeof applicationData.phone !== "string") {
            throw new CustomError("Phone number is required", HttpStatusCodes.BAD_REQUEST);
        }

        try {
            const existingApplication = await this.jobApplicationRepository.findByUserIdAndJobId(userId, jobId);
            if (existingApplication) {
                throw new CustomError("You have already applied for this job", HttpStatusCodes.CONFLICT);
            }
        } catch (error: any) {
            console.error("Error checking existing application:", error.message);
            throw new CustomError(
                "Failed to verify existing applications",
                HttpStatusCodes.INTERNAL_SERVER_ERROR
            );
        }

        // Create job application object
        const jobApplication: Partial<IJobApplication> = {
            jobId: new Types.ObjectId(jobId),
            userId: new Types.ObjectId(userId),
            fullName: applicationData.fullName.trim(),
            email: applicationData.email.trim(),
            phone: applicationData.phone.trim(),
            coverLetter: applicationData.coverLetter?.trim()||undefined,
            education: applicationData.education,
            experience: applicationData.experience || [],
            resumeUrl: applicationData.resumeUrl,
            customAnswers: applicationData.customAnswers || {},
            status: "pending", // Default status
            appliedAt: new Date(),
        };

        try {
            // Save job application to the repository
            const createdApplication = await this.jobApplicationRepository.create(jobApplication);
            return createdApplication;
        } catch (error: any) {
            console.error("Error applying for job:", error.message);
            throw new CustomError(
                "Failed to apply for job",
                HttpStatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }

    async hasApplied(jobId: string, userId: string): Promise<IJobApplication | null> {
        if (!jobId || !Types.ObjectId.isValid(jobId)) {
            throw new CustomError("Invalid or missing Job ID", HttpStatusCodes.BAD_REQUEST);
        }
    
        if (!userId || !Types.ObjectId.isValid(userId)) {
            throw new CustomError("Invalid or missing User ID", HttpStatusCodes.BAD_REQUEST);
        }
    
        return this.jobApplicationRepository.findByUserIdAndJobId(userId, jobId);
    }
}
