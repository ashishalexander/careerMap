import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

const logDirectory = path.join(__dirname, '../logs');

// Create a Daily Rotate File Transport
const dailyRotateFileTransport = new transports.DailyRotateFile({
  filename: 'application-%DATE%.log', // Log file format with date
  dirname: logDirectory,              // Directory for storing logs
  datePattern: 'YYYY-MM-DD',           // Date pattern for rotation
  maxFiles: '7d',                      // Keep logs for 7 days
  zippedArchive: true,                 // Compress logs after rotation
});

// Create the Winston logger
const logger = createLogger({
  level: 'info',                       // Log only info-level messages and above
  format: format.combine(
    format.timestamp(),                // Add timestamp to logs
    format.json()                      // Log format as JSON
  ),
  transports: [
    new transports.Console({           // Console output
      format: format.combine(
        format.colorize(),             // Colorize console logs
        format.simple()                // Simple format for console
      ),
    }),
    dailyRotateFileTransport,          // Log file with daily rotation
  ],
});

export default logger;
