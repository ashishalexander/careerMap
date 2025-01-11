import { IContentMod } from "../../models/contentModerationModel";

export interface FilterOptions {
    status?: string;
    page?: number;
    limit?: number;
}

export interface IContentModRepository{
    create(reportData: Partial<IContentMod>): Promise<IContentMod>
    getReports(filters: FilterOptions): Promise<{ reports: IContentMod[]; total: number }>
    updateReportStatus(reportId: string,status: string,response: string): Promise<IContentMod>
    togglePostDeletion(postId: string, isDeleted: boolean): Promise<void>
    getReportById(reportId: string): Promise<IContentMod | null>
}