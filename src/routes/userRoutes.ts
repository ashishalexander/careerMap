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
import { authMiddleware } from '../middleware/authMiddleware';
import { UserProfileRepository } from '../repositories/userProfileRepository';
import { UserProfileService } from '../services/userProfileService';
import { UserProfileController } from '../controllers/userProfileController';


const router = express.Router();

const userRepository = new UserRepository(); 
const otpRepository = new OtpRepository(); 
const userProfileRepository = new UserProfileRepository()
const userProfileService = new UserProfileService(userProfileRepository)
const userProfileController = new UserProfileController(userProfileService)

const userService = new UserService(userRepository); 
const otpService = new OtpService(otpRepository);
const s3service = new s3Service(userRepository)
const userController = new UserController(userService, otpService);
const authController = new AuthController(userRepository)
const S3Controller = new s3Controller(s3service); 


router.post('/signup', (req, res, next) => userController.signup(req, res, next));
router.post('/verify-otp', (req, res, next) => userController.verifyOtp(req, res,next));
router.get('/resend-otp', (req, res, next) => userController.resendOtp(req, res, next));
router.post('/signIn',(req,res, next)=>authController.signIn(req,res, next))
router.post('/forget-password',(req,res, next)=>authController.requestPasswordReset(req,res, next))
router.post('/reset-password', (req, res, next) => authController.resetPassword(req, res, next)); 
router.post('/Oauth-datasave',(req,res, next)=>userController.saveUser(req,res, next))

router.post('/upload-profile-avatar/:userId',authMiddleware, upload.single('file'), (req, res,next) => S3Controller.uploadProfilePicture(req, res,next)); 
router.post('/upload-profile-banner/:userId',authMiddleware, upload.single('file'), (req, res,next) => S3Controller.uploadBannerImage(req, res,next)); 
router.post('/profile/info/:userId',authMiddleware,(req,res,next)=>userProfileController.updateProfile(req,res,next) )
router.delete('/delete-profile/:userId', (req, res, next) => S3Controller.deleteProfilePicture(req, res,next)); 

router.post('/refresh-token',(req,res,next)=>authController.refreshToken(req,res,next))

export default router;
