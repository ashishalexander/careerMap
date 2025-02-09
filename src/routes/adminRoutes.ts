import express from "express";
import { AdminService } from "../services/adminService";
import { AdminController } from "../controllers/adminController";
import { AdminRepository } from "../repositories/adminRepository";
import { NotificationRepository } from "../repositories/NotificationRepository";
import { NotificationService } from "../services/NotificationService";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleAuth } from "../middleware/roleAuthMiddleware";
import { NotificationSocketHandler } from "../sockets/NotificationSocketHandler";
import { NotificationController } from "../controllers/NotificationController";
import { getSocketIO } from "../config/socket";
import { ContentModRepository } from "../repositories/ContentModRepository";
import { ContentModService } from "../services/ContentModService";
import { ContentModController } from "../controllers/ContentModController";
import { Roles } from "../config/Roles";
import { dashboardRepository } from "../repositories/dashboardRepository";
import { dashboardController } from "../controllers/dashboardController";
import { dashboardService } from "../services/dashboardService";
import { SubscriptionRepository } from "../repositories/adminSubscriptionRepository";
import { SubscriptionService } from "../services/adminSubscriptionService";
import { SubscriptionController } from "../controllers/adminSubscriptionController";
const router = express.Router();

// Initialize repositories
const adminRepository = new AdminRepository();
const notificationRepository = new NotificationRepository();

// Create factory function for notification dependencies
function createNotificationController() {
  const io = getSocketIO();
  const notificationSocketHandler = new NotificationSocketHandler(io);
  const notificationService = new NotificationService(
    notificationRepository,
    notificationSocketHandler
  );
  return new NotificationController(notificationService);
}

// Initialize admin service and controller
const adminService = new AdminService(adminRepository);
const adminController = new AdminController(adminService);

const contentModRepository = new ContentModRepository();
const contentModService = new ContentModService(contentModRepository);
const contentModController = new ContentModController(contentModService);

const dashboard_Repository = new dashboardRepository();
const dashboard_Service = new dashboardService(dashboard_Repository);
const dashboard_Controller = new dashboardController(dashboard_Service);

const subscriptionRepository = new SubscriptionRepository();
const subscriptionService = new SubscriptionService(subscriptionRepository);
const subscriptionController = new SubscriptionController(subscriptionService);

// Routes
router.post("/signIn", (req, res, next) =>
  adminController.login(req, res, next)
);
router.get(
  "/fetchUsers",
  authMiddleware,
  roleAuth([Roles.ADMIN]),
  (req, res, next) => adminController.fetchUsers(req, res, next)
);
router.patch(
  "/blockUser/:userId",
  authMiddleware,
  roleAuth([Roles.ADMIN]),
  (req, res, next) => adminController.blockUser(req, res, next)
);
router.post(
  "/notifications/create",
  authMiddleware,
  roleAuth([Roles.ADMIN]),
  (req, res, next) => {
    const notificationController = createNotificationController();
    return notificationController.createNotification(req, res, next);
  }
);
router.get(
  "/reports",
  authMiddleware,
  roleAuth([Roles.ADMIN]),
  (req, res, next) => contentModController.getReports(req, res, next)
);
router.post(
  "/reports/:reportId/action",
  authMiddleware,
  roleAuth([Roles.ADMIN]),
  (req, res, next) => contentModController.handleReportAction(req, res, next)
);

router.get(
  "/dashboard/metrics",
  authMiddleware,
  roleAuth([Roles.ADMIN]),
  (req, res, next) => dashboard_Controller.getDashboardMetrics(req, res, next)
);

router.get(
  "/metrics/jobs",
  authMiddleware,
  roleAuth([Roles.ADMIN]),
  (req, res, next) => dashboard_Controller.getJobMetrics(req, res, next)
);

router.get(
  "/metrics/network",
  authMiddleware,
  roleAuth([Roles.ADMIN]),
  (req, res, next) => dashboard_Controller.getNetworkMetrics(req, res, next)
);

router.get(
  "/metrics/users",
  authMiddleware,
  roleAuth([Roles.ADMIN]),
  (req, res, next) => dashboard_Controller.getUserGrowthMetrics(req, res, next)
);
router.get(
  "/subscriptions",
  authMiddleware,
  roleAuth([Roles.ADMIN]),
  (req, res, next) => subscriptionController.getSubscriptions(req, res, next)
);
router.get(
  "/subscriptions/analytics",
  authMiddleware,
  roleAuth([Roles.ADMIN]),
  (req, res, next) => subscriptionController.getAnalytics(req, res, next)
);

export default router;
