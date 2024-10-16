// src/app.ts
import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import userRouter from './routes/userRoutes'
import adminRouter from './routes/adminRoutes'
import dotenv from 'dotenv';
import logger from './middleware/logger';
import { errorMiddleware } from './middleware/errorMiddleware';


dotenv.config();
const app: Application = express();
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); 


app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),  
    },
  }));
  
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
  });

app.use('/api/users',userRouter)
app.use('/api/admin',adminRouter)

app.use(errorMiddleware)

export default app;
