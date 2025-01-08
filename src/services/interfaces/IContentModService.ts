import { IContentMod } from "../../models/contentModerationModel";

export interface ReportFilters {
    status?: string;
    page?: number;
    limit?: number;
}

export interface IContentModService{
    createReport(postId: string,userId: string,reason: string,details?: string): Promise<IContentMod>
    getReports(filters: ReportFilters):Promise<any>
    handleReportAction(reportId: string,action: string,response: string,isDeleted:boolean): Promise<IContentMod>
}