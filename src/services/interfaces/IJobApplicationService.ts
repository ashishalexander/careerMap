import { IJobApplication } from "../../models/JobApplication";

export interface IJobApplicationService{
    applyForJob(jobId: string, userId: string, applicationData: Partial<IJobApplication>): Promise<IJobApplication>
    hasApplied(jobId: string, userId: string): Promise<IJobApplication | null>}