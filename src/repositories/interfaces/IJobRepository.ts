import { IJob } from "../../models/JobsModel";

export interface IJobRepository{
    create(job: Partial<IJob>): Promise<IJob>
    getAllJobs(skip: number, limit: number): Promise<IJob[]>
    delete(postId: string): Promise<void> 
    findById(postId: string): Promise<IJob | null>
    update(jobId: string, updatedData: Partial<IJob>): Promise<IJob | null>
}