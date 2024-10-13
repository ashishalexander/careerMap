// src/routes/userRoutes.ts
import express from 'express';
import { UserService } from '../services/userService';
import { OtpService } from '../services/otpService';
import { UserController } from '../controllers/userController';
import { UserRepository } from '../repositories/userRepository'; 
import { OtpRepository } from '../repositories/otpRepository'; 
import {AuthController} from '../controllers/authController'
import { AuthService } from '../services/authService';

const router = express.Router();

const userRepository = new UserRepository(); 
const otpRepository = new OtpRepository(); 
const userService = new UserService(userRepository); 
const otpService = new OtpService(otpRepository);
const userController = new UserController(userService, otpService);
const authController = new AuthController(userRepository)

router.post('/signup', (req, res) => userController.signup(req, res));
router.post('/verify-otp', (req, res) => userController.verifyOtp(req, res));
router.get('/resend-otp', (req, res) => userController.resendOtp(req, res));
router.post('/signIn',(req,res)=>authController.signIn(req,res))
router.post('/forget-password',(req,res)=>authController.requestPasswordReset(req,res))
router.post('/reset-password', (req, res) => authController.resetPassword(req, res)); 
router.post('/Oauth-datasave',(req,res)=>userController.saveUser(req,res))

export default router;
