import express from 'express'
import { AdminService } from '../services/adminService';  
import { AdminController } from '../controllers/adminController'; 
import { AdminRepository } from '../repositories/adminRepository'; 
import { AuthController } from '../controllers/authController'; 
const router = express.Router()

const adminRepository = new AdminRepository();
const adminService = new AdminService(adminRepository); 
const adminController = new AdminController(adminService);


router.post('/signIn', (req, res, next) => adminController.login(req, res, next));




export default router 
