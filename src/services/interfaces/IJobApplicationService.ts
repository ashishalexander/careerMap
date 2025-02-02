import { IJobApplication } from "../../models/JobApplication";
import { IJob } from "../../models/JobsModel";

export interface IJobApplicationService{
    applyForJob(jobId: string, userId: string, applicationData: Partial<IJobApplication>): Promise<IJobApplication>
    hasApplied(jobId: string, userId: string): Promise<IJobApplication | null>
    getJobApplications(jobId: string, page: number, limit: number): Promise<{ applications: IJobApplication[], total: number }>;
    getJobsByRecruiterId(recruiterId: string): Promise<IJob[]> 
}