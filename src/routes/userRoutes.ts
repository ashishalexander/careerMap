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
import { UserNetworkController } from '../controllers/UserNetworkController';
import { UserNetworkService } from '../services/UserNetworkService';
import { UserNetworkRepository } from '../repositories/UserNetworkRepository';
import {UserPaymentService} from '../services/UserPaymentServices'
import {UserPaymentController} from '../controllers/UserPaymentController'
import { UserPaymentRepository } from '../repositories/UserPaymentRepository';
const router = express.Router();

const userRepository = new UserRepository(); 
const otpRepository = new OtpRepository(); 
const userNetworkRepository = new UserNetworkRepository()
const userProfileRepository = new UserProfileRepository()
const userPaymentRepository = new UserPaymentRepository()
const userProfileService = new UserProfileService(userProfileRepository)
const userProfileController = new UserProfileController(userProfileService)

const userService = new UserService(userRepository); 
const otpService = new OtpService(otpRepository);
const s3service = new s3Service(userRepository)
const userNetworkService = new UserNetworkService(userNetworkRepository)
const userPaymentService = new UserPaymentService(userPaymentRepository)
const userController = new UserController(userService, otpService);
const authController = new AuthController(userRepository)
const S3Controller = new s3Controller(s3service); 
const userNetworkController = new UserNetworkController(userNetworkService)
const userPaymentController = new UserPaymentController(userPaymentService)



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
router.post('/profile/about/:userId',authMiddleware,(req,res,next)=>userProfileController.updateAbout(req,res,next) )
router.post('/profile/education/:userId',authMiddleware,(req,res,next)=>userProfileController.updateEducation(req,res,next))
router.post('/profile/experience/:userId',authMiddleware,(req,res,next)=>userProfileController.addExperience(req,res,next))
router.put('/profile/experience/:userId/:experienceId',authMiddleware,(req,res,next)=>userProfileController.updateExperience(req,res,next))
router.delete('/delete-profile/:userId',authMiddleware, (req, res, next) => S3Controller.deleteProfilePicture(req, res,next)); 
router.delete('/delete/profile-education/:index/:userId',authMiddleware,(req,res,next)=>userProfileController.deleteEducation(req,res,next))
router.delete('/delete/profile-experience/:userId/:experienceId',authMiddleware,(req,res,next)=>userProfileController.deleteExperience(req,res,next))
router.post('/refresh-token',(req,res,next)=>authController.refreshToken(req,res,next))
router.get('/network/pending-requests/:userId',authMiddleware,(req,res,next)=>userNetworkController.getPendingRequests(req,res,next))
router.post('/premium/create-order/',authMiddleware,(req,res,next)=>userPaymentController.createOrder(req,res,next))
router.post('/premium/verify-payment/',authMiddleware,(req,res,next)=>userPaymentController.verifyPayment(req,res,next))
export default router;
