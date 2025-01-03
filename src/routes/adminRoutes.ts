import express from 'express'
import { AdminService } from '../services/adminService'
import { AdminController } from '../controllers/adminController'
import { AdminRepository } from '../repositories/adminRepository'
import { NotificationRepository } from '../repositories/NotificationRepository'
import { NotificationService } from '../services/NotificationService'
import { authMiddleware } from '../middleware/authMiddleware'
import { roleAuth } from '../middleware/roleAuthMiddleware'
import { NotificationSocketHandler } from '../sockets/NotificationSocketHandler'
import { NotificationController } from '../controllers/NotificationController'
import { getSocketIO } from '../config/socket'

const router = express.Router()

// Initialize repositories
const adminRepository = new AdminRepository()
const notificationRepository = new NotificationRepository()

// Create factory function for notification dependencies
function createNotificationController() {
    const io = getSocketIO()
    const notificationSocketHandler = new NotificationSocketHandler(io)
    const notificationService = new NotificationService(notificationRepository, notificationSocketHandler)
    return new NotificationController(notificationService)
}

// Initialize admin service and controller
const adminService = new AdminService(adminRepository)
const adminController = new AdminController(adminService)

// Routes
router.post('/signIn', (req, res, next) => adminController.login(req, res, next))
router.get('/fetchUsers', authMiddleware, roleAuth(['admin']), (req, res, next) => adminController.fetchUsers(req, res, next))
router.patch('/blockUser/:userId', authMiddleware, roleAuth(['admin']), (req, res, next) => adminController.blockUser(req, res, next))
router.post('/notifications/create', authMiddleware, roleAuth(['admin']), (req, res, next) => {
    const notificationController = createNotificationController()
    return notificationController.createNotification(req, res, next)
})

export default router