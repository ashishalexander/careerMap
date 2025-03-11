import { ReportOptions } from '../../interfaces/reports';

export interface IReportRepository {
  generateReportData(options: ReportOptions): Promise<any>;
}