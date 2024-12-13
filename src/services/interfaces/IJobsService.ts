import { IJob } from "../../models/JobsModel";

export interface  IJobService{
    createJob(userId: string, newJob: Partial<IJob>): Promise<any>
    fetchAllJobs(page: number, limit: number): Promise<any>
    
}