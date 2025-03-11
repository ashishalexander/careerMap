// interfaces/report.ts
export type ReportTimeframe = 'lastWeek' | 'lastMonth' | 'lastQuarter' | 'ytd' | 'custom';
export type ReportType = 'userGrowth' | 'jobMarket'  | 'applicationStats' | 'revenue';
export type ReportFormat = 'pdf';

export interface ReportOptions {
    reportType: ReportType;
    timeframe: ReportTimeframe;
    format: ReportFormat;
    startDate?: string; // ISO string for custom timeframe
    endDate?: string; // ISO string for custom timeframe
  }