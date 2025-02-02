import { IJobApplication } from "../../models/JobApplication";
import { IJob } from "../../models/JobsModel";

export interface IJobApplicationRepository{
    create(application: Partial<IJobApplication>): Promise<IJobApplication>
    findByUserIdAndJobId(userId: string, jobId: string): Promise<IJobApplication | null>
    findByJobId(jobId: string, page: number, limit: number): Promise<{ applications: IJobApplication[], total: number }>;
    findByRecruiterId(recruiterId: string): Promise<IJob[]>
}