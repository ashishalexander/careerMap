import { IJobApplication } from "../../models/JobApplication";

export interface IJobApplicationRepository{
    create(application: Partial<IJobApplication>): Promise<IJobApplication>
    findByUserIdAndJobId(userId: string, jobId: string): Promise<IJobApplication | null>
}