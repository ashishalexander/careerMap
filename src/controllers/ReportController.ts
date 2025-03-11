// src/controllers/reportController.ts
import { Request, Response, NextFunction } from 'express';
import { IReportService } from '../services/interfaces/IReportService';
import { IReportController } from './interfaces/IReportController';
import { ReportFormat, ReportOptions, ReportTimeframe, ReportType } from '../interfaces/reports';
import { CustomError } from '../errors/customErrors';

export class ReportController implements IReportController {
  constructor(private reportService: IReportService) {}

  generateReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { reportType, timeframe, format, startDate, endDate } = req.body;
      
      if (!reportType || !timeframe || !format) {
        throw new CustomError('Report type, timeframe, and format are required', 400);
      }
      
      if (timeframe === 'custom' && (!startDate || !endDate)) {
        throw new CustomError('Start date and end date are required for custom timeframe', 400);
      }
      
      const reportOptions: ReportOptions = {
        reportType: reportType as ReportType,
        timeframe: timeframe as ReportTimeframe,
        format: format as ReportFormat,
        startDate: startDate,
        endDate: endDate
      };
      
      // Generate report
      const fileBuffer = await this.reportService.generateReport(reportOptions);
      
      // Set response headers based on format
      const contentType = 'application/pdf';
      const fileExtension = 'pdf';
    
      
      // Set response headers
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename=${reportType}-${timeframe}.${fileExtension}`);
      res.setHeader('Content-Length', fileBuffer.length);
      
      res.status(200).send(fileBuffer);
    } catch (error) {
      next(error);
    }
  };  
}