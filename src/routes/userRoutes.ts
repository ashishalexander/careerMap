// src/routes/userRoutes.ts
import express from 'express';
import { UserService } from '../services/userService';
import { OtpService } from '../services/otpService';
import { UserController } from '../controllers/userController';
import { UserRepository } from '../repositories/userRepository'; 
import { OtpRepository } from '../repositories/otpRepository'; 
import {AuthController} from '../controllers/authController';
import { s3Controller } from '../controllers/s3Controller'; 
import { s3Service } from '../services/s3Service';
import upload from '../middleware/multer-s3';


const router = express.Router();

const userRepository = new UserRepository(); 
const otpRepository = new OtpRepository(); 
const userService = new UserService(userRepository); 
const otpService = new OtpService(otpRepository);
const s3service = new s3Service(userRepository)
const userController = new UserController(userService, otpService);
const authController = new AuthController(userRepository)
const S3Controller = new s3Controller(s3service); 


router.post('/signup', (req, res) => userController.signup(req, res));
router.post('/verify-otp', (req, res) => userController.verifyOtp(req, res));
router.get('/resend-otp', (req, res) => userController.resendOtp(req, res));
router.post('/signIn',(req,res)=>authController.signIn(req,res))
router.post('/forget-password',(req,res)=>authController.requestPasswordReset(req,res))
router.post('/reset-password', (req, res) => authController.resetPassword(req, res)); 
router.post('/Oauth-datasave',(req,res)=>userController.saveUser(req,res))

router.post('/upload-profile/:userId', upload.single('profilePicture'), (req, res,next) => S3Controller.uploadProfilePicture(req, res)); 
router.delete('/delete-profile/:userId', (req, res) => S3Controller.deleteProfilePicture(req, res)); 

export default router;
