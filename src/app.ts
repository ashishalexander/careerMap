// src/app.ts
import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { createUserRoutes } from "./routes/userRoutes";
import { createAdminRoutes } from "./routes/adminRoutes";
import dotenv from 'dotenv';
import logger from './middleware/logger';
import { errorMiddleware } from './middleware/errorMiddleware';
import cookieParser from 'cookie-parser';
import { Server } from 'http';
import { initializeSubscriptionExpiryCron } from './cron/subscriptionExpiry';

import {
  userController,
  authController,
  S3Controller,
  userProfileController,
  createNetworkController,
  userPaymentController,
  createUserNotificationController,
  userJobController,
  jobApplicationController,
  createNotificationController as userCreateNotificationController,
  contentModController as userContentModController,
  chatController,
} from "./injections/userDependencies";

import {
  adminController,
 createNotificationController,
  contentModController,
  dashboardCtrl,
  subscriptionCtrl,
  reportController
} from "./injections/adminDependencies";


dotenv.config();
const app: Application = express();
// Create HTTP server instance
const server = new Server(app);
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
 
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS','PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie', 'Date', 'ETag']
})); 
app.use(cookieParser()); 

app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),  
    },
  }));
  
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
  });

  // Initialize socket.io
import { initSocket } from "./config/socket";
const io = initSocket(server);

// Create and mount user routes with injected dependencies and pass the io instance
const userRoutes = createUserRoutes(
  userController,
  authController,
  S3Controller,
  userProfileController,
  createNetworkController,
  userPaymentController,
  createUserNotificationController,
  userJobController,
  jobApplicationController,
  userCreateNotificationController,
  userContentModController,
  chatController,
  io
);
app.use('/api/users',userRoutes)
const notificationController = createNotificationController(io);
// Create admin routes by injecting the dependencies
const adminRoutes = createAdminRoutes(
  adminController,
  notificationController,
  contentModController,
  dashboardCtrl,
  subscriptionCtrl,
  reportController
);
app.use('/api/admin',adminRoutes)




app.use(errorMiddleware)
initializeSubscriptionExpiryCron();

export {app,server};
