import { IJob } from "../../models/JobsModel";

export interface IJobRepository{
    create(job: Partial<IJob>): Promise<IJob>
    getAllJobs(skip: number, limit: number): Promise<IJob[]>
    getJobsByRecruiter(recruiterId: string, skip: number, limit: number): Promise<IJob[]>;
}