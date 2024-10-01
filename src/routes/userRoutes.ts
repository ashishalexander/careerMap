// src/routes/userRoutes.ts
import express from 'express';
import { UserService } from '../services/userService';
import { OtpService } from '../services/otpService';
import { UserController } from '../controllers/userController';
import { UserRepository } from '../repositories/userRepository'; // Import UserRepository
import { OtpRepository } from '../repositories/otpRepository'; // Import OtpRepository

const router = express.Router();

// Initialize repositories
const userRepository = new UserRepository(); // Create an instance of UserRepository
const otpRepository = new OtpRepository(); // Create an instance of OtpRepository

// Initialize services and controller
const userService = new UserService(userRepository); // Pass userRepository to UserService
const otpService = new OtpService(otpRepository);
const userController = new UserController(userService, otpService);

// Route for user signup
router.post('/signup', (req, res) => userController.signup(req, res));

// Route for OTP verification
router.post('/verify-otp', (req, res) => userController.verifyOtp(req, res));

// New Route for resending OTP
router.post('/resend-otp', (req, res) => userController.resendOtp(req, res));


export default router;
