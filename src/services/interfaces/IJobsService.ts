import { IJob } from "../../models/JobsModel";

export interface  IJobService{
    createJob(userId: string, newJob: Partial<IJob>): Promise<any>
    fetchJobs(userId: string, page: number, limit: number): Promise<any>
    fetchAllJobs(page: number, limit: number): Promise<any>
}