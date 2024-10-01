// src/app.ts
import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import userRouter from './routes/userRoutes'
import dotenv from 'dotenv';

dotenv.config();
const app: Application = express();

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cors()); 
app.use(morgan('dev'));

app.use('/api/users',userRouter)


export default app;
