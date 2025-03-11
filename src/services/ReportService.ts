// src/services/reportService.ts
import { IReportService } from './interfaces/IReportService';
import { IReportRepository } from '../repositories/interfaces/IReportRepository';
import { ReportOptions } from '../interfaces/reports';
import { CustomError } from '../errors/customErrors';
import PDFDocument from 'pdfkit';

export class ReportService implements IReportService {
  constructor(private reportRepository: IReportRepository) {}

  async generateReport(options: ReportOptions): Promise<Buffer> {
    try {
      // Get report data from repository
      const reportData = await this.reportRepository.generateReportData(options);
      console.log(reportData)
      
      // Generate PDF from the data
      const pdfBuffer = await this.createPDF(reportData, options.reportType);
      
      return pdfBuffer;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to generate report', 500);
    }
  }

  private async createPDF(data: any, reportType: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        // Create a PDF document
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];
        
        // Collect PDF data chunks
        doc.on('data', buffer => buffers.push(buffer));
        
        // When PDF is done being generated
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Add content to the PDF based on report type
        this.addReportContent(doc, data, reportType);
        
        // Finalize the PDF
        doc.end();
      } catch (error) {
        console.error(error)
        reject(new CustomError('Failed to create PDF', 500));
      }
    });
  }

  private addReportContent(doc: PDFKit.PDFDocument, data: any, reportType: string): void {
   
    // Add different content based on report type
    switch (reportType) {
      case 'userGrowth':
        this.addUserGrowthContent(doc, data);
        break;
      case 'revenue':
        this.addRevenueContent(doc, data);
        break;
    }
    
  }

  private addUserGrowthContent(doc: PDFKit.PDFDocument, data: any): void {
    // Store current Y position
    const currentY = doc.y;
    
    // Position the text over the rectangle at the current Y position + some padding
    doc.fillColor('#0056b3')
       .fontSize(26)
       .text('User Growth Summary', 50, currentY + 15, { align: 'center', width: doc.page.width - 100 });
    
    // Move down to account for the header height
    doc.y = currentY + 60;
    
    // Date range with better formatting
    const startDate = new Date(data.dateRange.startDate).toLocaleDateString();
    const endDate = new Date(data.dateRange.endDate).toLocaleDateString();
    doc.fontSize(12)
       .fillColor('#555555')
       .text(`Report Period: ${startDate} to ${endDate}`, { align: 'center' });
    doc.moveDown(2);
    
    // Reset text color for the rest of the document
    doc.fillColor('#333333');
  
    // Daily User Registration with proper table
    doc.fontSize(16)
       .text('Daily User Registration:', { underline: true });
    doc.moveDown();
    
    // Create table for daily user data
    const tableTop = doc.y;
    const tableWidth = 400;
    const colWidths = [200, 200];
    
    // Draw table header
    doc.rect(100, tableTop, tableWidth, 25)
       .fill('#f2f2f2');
    
    doc.fontSize(12)
       .fillColor('#000000')
       .text('Date', 110, tableTop + 7)
       .text('New Users', 110 + colWidths[0], tableTop + 7);
    
    // Draw table rows
    let yPos = tableTop + 25;
    let rowCount = 0;
    
    // Check if userGrowth exists and is an array
    if (data.userGrowth && Array.isArray(data.userGrowth) && data.userGrowth.length > 0) {
      data.userGrowth.forEach((day: any) => {
        // Add a new page if we're near the bottom
        if (yPos > doc.page.height - 100) {
          doc.addPage();
          yPos = 50;
          
          // Redraw table header on new page
          doc.rect(100, yPos, tableWidth, 25)
             .fill('#f2f2f2');
          
          doc.fontSize(12)
             .fillColor('#000000')
             .text('Date', 110, yPos + 7)
             .text('New Users', 110 + colWidths[0], yPos + 7);
          
          yPos += 25;
        }
        
        // Alternate row background
        if (rowCount % 2 === 0) {
          doc.rect(100, yPos, tableWidth, 25)
             .fill('#f9f9f9');
        }
        
        // Handle different _id formats
        let dateStr;
        if (day._id && typeof day._id === 'object') {
          // If _id is an object with year, month, day properties
          if (day._id.year && day._id.month && day._id.day) {
            dateStr = `${day._id.year}-${day._id.month.toString().padStart(2, '0')}-${day._id.day.toString().padStart(2, '0')}`;
          } else {
            // If _id is a different object format, convert to ISO string
            dateStr = new Date(day._id).toISOString().split('T')[0];
          }
        } else {
          // If _id is a string or other format
          dateStr = 'N/A';
        }
        
        const userCount = typeof day.count === 'number' ? day.count : 0;
        
        doc.fillColor('#333333')
           .text(dateStr, 110, yPos + 7)
           .text(userCount.toString(), 110 + colWidths[0], yPos + 7);
        
        yPos += 25;
        rowCount++;
      });
    } else {
      // Display "No data" message
      doc.rect(100, yPos, tableWidth, 25)
         .fill('#f9f9f9');
      
      doc.fontSize(12)
         .fillColor('#777777')
         .text('No user growth data available for this period', 110, yPos + 7, { width: tableWidth - 20, align: 'center' });
      
      rowCount = 1;
      yPos += 25;
    }
    
    // Draw table borders
    doc.rect(100, tableTop, tableWidth, 25 + (rowCount * 25))
       .stroke('#dddddd');
    
    // Vertical line
    doc.moveTo(100 + colWidths[0], tableTop)
       .lineTo(100 + colWidths[0], tableTop + 25 + (rowCount * 25))
       .stroke('#dddddd');
    
    // Horizontal line after header
    doc.moveTo(100, tableTop + 25)
       .lineTo(100 + tableWidth, tableTop + 25)
       .stroke('#dddddd');
    
    doc.y = yPos + 30;
    
    // Subscription data if available
    if (data.subscriptionGrowth && data.subscriptionGrowth.length > 0) {
      doc.fontSize(16)
         .text('Subscription Breakdown:', { underline: true, align: 'left' });
      doc.moveDown();
      
      // Create table for subscription data
      const subTableTop = doc.y;
      const subTableWidth = 450;
      const subColWidths = [225, 125, 100];
      
      // Draw table header
      doc.rect(80, subTableTop, subTableWidth, 25)
         .fill('#f2f2f2');
      
      doc.fontSize(12)
         .fillColor('#000000')
         .text('Plan Type', 90, subTableTop + 7)
         .text('Subscribers', 90 + subColWidths[0], subTableTop + 7)
         .text('Percentage', 90 + subColWidths[0] + subColWidths[1], subTableTop + 7);
      
      // Draw table rows
      let subYPos = subTableTop + 25;
      let subRowCount = 0;
      
      const subscriptionsByType = data.subscriptionGrowth.reduce((acc: any, sub: any) => {
        const planType = sub._id.planType || 'Unknown';
        if (!acc[planType]) acc[planType] = 0;
        acc[planType] += sub.count;
        return acc;
      }, {});
      
      const totalSubs = Object.values(subscriptionsByType).reduce((sum: any, count: any) => sum + count, 0) as number;
      
      Object.entries(subscriptionsByType).forEach(([plan, count]) => {
        // Alternate row background
        if (subRowCount % 2 === 0) {
          doc.rect(80, subYPos, subTableWidth, 25)
             .fill('#f9f9f9');
        }
        const countValue = typeof count === 'number' ? count : 0;

        const percentage = totalSubs > 0 ? 
          Math.round(((count as number) / totalSubs) * 100) : 0;
        
        doc.fillColor('#333333')
           .text(plan, 90, subYPos + 7)
           .text(countValue.toString(), 90 + subColWidths[0], subYPos + 7)
           .text(`${percentage}%`, 90 + subColWidths[0] + subColWidths[1], subYPos + 7);
        
        subYPos += 25;
        subRowCount++;
      });
      
      // Draw table borders
      doc.rect(80, subTableTop, subTableWidth, 25 + (subRowCount * 25))
         .stroke('#dddddd');
      
      // Vertical lines
      doc.moveTo(80 + subColWidths[0], subTableTop)
         .lineTo(80 + subColWidths[0], subTableTop + 25 + (subRowCount * 25))
         .stroke('#dddddd');
      
      doc.moveTo(80 + subColWidths[0] + subColWidths[1], subTableTop)
         .lineTo(80 + subColWidths[0] + subColWidths[1], subTableTop + 25 + (subRowCount * 25))
         .stroke('#dddddd');
      
      // Horizontal line after header
      doc.moveTo(80, subTableTop + 25)
         .lineTo(80 + subTableWidth, subTableTop + 25)
         .stroke('#dddddd');
    }
    
    // Add recommendation
    doc.moveDown();
  }
  
  private addRevenueContent(doc: PDFKit.PDFDocument, data: any): void {

    
    doc.fillColor('#0056b3')
       .fontSize(26)
       .text('Revenue Summary', { align: 'center', width: doc.page.width - 100 });
    doc.moveDown(0.5);
    
    // Date range with better formatting
    const startDate = new Date(data.dateRange.startDate).toLocaleDateString();
    const endDate = new Date(data.dateRange.endDate).toLocaleDateString();
    doc.fontSize(12)
       .fillColor('#555555')
       .text(`Report Period: ${startDate} to ${endDate}`, { align: 'center' });
    doc.moveDown(2);
    
    // Reset text color for the rest of the document
    doc.fillColor('#333333');

    doc.fontSize(18)
       .text('Executive Summary', { underline: true });
    doc.moveDown();
    
    // Total revenue with larger font for emphasis
    const totalTransactions = data.revenueByPlan.reduce((sum: number, plan: any) => sum + plan.count, 0);
    doc.fontSize(16)
       .text(`Total Revenue: $${data.totalRevenue.toFixed(2)}`, { continued: true })
       .text(`   Total Transactions: ${totalTransactions}`, { align: 'right' });
    doc.moveDown(2);
    
    // Revenue by Plan with proper table
    doc.fontSize(16)
       .text('Revenue by Plan:', { underline: true });
    doc.moveDown();
    
    // Create table for revenue by plan
    const planTableTop = doc.y;
    const planTableWidth = 500;
    const planColWidths = [150, 120, 120, 110];
    
    // Draw table header
    doc.rect(50, planTableTop, planTableWidth, 25)
       .fill('#f2f2f2');
    
    doc.fontSize(12)
       .fillColor('#000000')
       .text('Plan Type', 60, planTableTop + 7)
       .text('Revenue ($)', 60 + planColWidths[0], planTableTop + 7)
       .text('Transactions', 60 + planColWidths[0] + planColWidths[1], planTableTop + 7)
       .text('Percentage', 60 + planColWidths[0] + planColWidths[1] + planColWidths[2], planTableTop + 7);
    
    // Draw table rows
    let yPos = planTableTop + 25;
    let rowCount = 0;
    
    // Check if revenueByPlan exists and is an array
    if (data.revenueByPlan && Array.isArray(data.revenueByPlan) && data.revenueByPlan.length > 0) {
      data.revenueByPlan.forEach((plan: any) => {
        // Alternate row background
        if (rowCount % 2 === 0) {
          doc.rect(50, yPos, planTableWidth, 25)
             .fill('#f9f9f9');
        }
        
        // Ensure values exist and format properly
        const planName = plan._id || 'Unknown';
        const revenue = typeof plan.totalRevenue === 'number' ? plan.totalRevenue.toFixed(2) : '0.00';
        const count = typeof plan.count === 'number' ? plan.count : 0;
        const percentage = data.totalRevenue > 0 ? 
          Math.round((plan.totalRevenue / data.totalRevenue) * 100) : 0;
        
        doc.fillColor('#333333')
           .text(planName, 60, yPos + 7)
           .text(`$${revenue}`, 60 + planColWidths[0], yPos + 7)
           .text(count.toString(), 60 + planColWidths[0] + planColWidths[1], yPos + 7)
           .text(`${percentage}%`, 60 + planColWidths[0] + planColWidths[1] + planColWidths[2], yPos + 7);
        
        yPos += 25;
        rowCount++;
      });
    } else {
      // Display "No data" message if no revenue data
      doc.rect(50, yPos, planTableWidth, 25)
         .fill('#f9f9f9');
      
      doc.fontSize(12)
         .fillColor('#777777')
         .text('No revenue data available for this period', 60, yPos + 7, { width: planTableWidth - 20, align: 'center' });
      
      rowCount = 1;
      yPos += 25;
    }
    
    // Draw table borders
    doc.rect(50, planTableTop, planTableWidth, 25 + (rowCount * 25))
       .stroke('#dddddd');
    
    // Vertical lines
    doc.moveTo(50 + planColWidths[0], planTableTop)
       .lineTo(50 + planColWidths[0], planTableTop + 25 + (rowCount * 25))
       .stroke('#dddddd');
    
    doc.moveTo(50 + planColWidths[0] + planColWidths[1], planTableTop)
       .lineTo(50 + planColWidths[0] + planColWidths[1], planTableTop + 25 + (rowCount * 25))
       .stroke('#dddddd');
    
    doc.moveTo(50 + planColWidths[0] + planColWidths[1] + planColWidths[2], planTableTop)
       .lineTo(50 + planColWidths[0] + planColWidths[1] + planColWidths[2], planTableTop + 25 + (rowCount * 25))
       .stroke('#dddddd');
    
    // Horizontal line after header
    doc.moveTo(50, planTableTop + 25)
       .lineTo(50 + planTableWidth, planTableTop + 25)
       .stroke('#dddddd');
    
    doc.y = yPos + 30;
    
    // Daily revenue table
    doc.fontSize(16)
       .text('Daily Revenue:', { underline: true });
    doc.moveDown();
    
    // Create table for daily revenue
    const dailyTableTop = doc.y;
    const dailyTableWidth = 400;
    const dailyColWidths = [200, 200];
    
    // Draw table header
    doc.rect(100, dailyTableTop, dailyTableWidth, 25)
       .fill('#f2f2f2');
    
    doc.fontSize(12)
       .fillColor('#000000')
       .text('Date', 110, dailyTableTop + 7)
       .text('Revenue ($)', 110 + dailyColWidths[0], dailyTableTop + 7);
    
    // Draw table rows
    yPos = dailyTableTop + 25;
    rowCount = 0;
    
    // Check if dailyRevenue exists and is an array
    if (data.dailyRevenue && Array.isArray(data.dailyRevenue) && data.dailyRevenue.length > 0) {
      data.dailyRevenue.forEach((day: any) => {
        // Add a new page if we're near the bottom
        if (yPos > doc.page.height - 100) {
          doc.addPage();
          yPos = 50;
          
          // Redraw table header on new page
          doc.rect(100, yPos, dailyTableWidth, 25)
             .fill('#f2f2f2');
          
          doc.fontSize(12)
             .fillColor('#000000')
             .text('Date', 110, yPos + 7)
             .text('Revenue ($)', 110 + dailyColWidths[0], yPos + 7);
          
          yPos += 25;
        }
        
        // Alternate row background
        if (rowCount % 2 === 0) {
          doc.rect(100, yPos, dailyTableWidth, 25)
             .fill('#f9f9f9');
        }
        
        // Handle different _id formats
        let dateStr;
        if (day._id && typeof day._id === 'object') {
          // If _id is an object with year, month, day properties
          if (day._id.year && day._id.month && day._id.day) {
            dateStr = `${day._id.year}-${day._id.month.toString().padStart(2, '0')}-${day._id.day.toString().padStart(2, '0')}`;
          } else {
            // If _id is a different object format, convert to ISO string
            dateStr = new Date(day._id).toISOString().split('T')[0];
          }
        } else {
          // If _id is a string or other format
          dateStr = 'N/A';
        }
        
        const revenue = typeof day.dailyRevenue === 'number' ? day.dailyRevenue.toFixed(2) : '0.00';
        
        doc.fillColor('#333333')
           .text(dateStr, 110, yPos + 7)
           .text(`$${revenue}`, 110 + dailyColWidths[0], yPos + 7);
        
        yPos += 25;
        rowCount++;
      });
    } else {
      // Display "No data" message
      doc.rect(100, yPos, dailyTableWidth, 25)
         .fill('#f9f9f9');
      
      doc.fontSize(12)
         .fillColor('#777777')
         .text('No daily revenue data available for this period', 110, yPos + 7, { width: dailyTableWidth - 20, align: 'center' });
      
      rowCount = 1;
      yPos += 25;
    }
    
    // Draw table borders
    doc.rect(100, dailyTableTop, dailyTableWidth, 25 + (rowCount * 25))
       .stroke('#dddddd');
    
    // Vertical line
    doc.moveTo(100 + dailyColWidths[0], dailyTableTop)
       .lineTo(100 + dailyColWidths[0], dailyTableTop + 25 + (rowCount * 25))
       .stroke('#dddddd');
    
    // Horizontal line after header
    doc.moveTo(100, dailyTableTop + 25)
       .lineTo(100 + dailyTableWidth, dailyTableTop + 25)
       .stroke('#dddddd');
  }
}