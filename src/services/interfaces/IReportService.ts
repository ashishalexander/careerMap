import { ReportOptions } from '../../interfaces/reports';

export interface IReportService {
  generateReport(options: ReportOptions): Promise<Buffer>;
}