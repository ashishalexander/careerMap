// src/routes/adminRoutesFactory.ts
import express from "express";
import { IAdminController } from "../controllers/interfaces/IadminController";
import { INotificationController } from "../controllers/interfaces/INotificationController";
import { IContentModController } from "../controllers/interfaces/IContentModController";
import { IDashboardController } from "../controllers/interfaces/IdashboardController";
import { ISubscriptionController } from "../controllers/interfaces/IadminSubCtrl";
import { adminAuthMiddleware } from "../middleware/adminAuthMiddleware";
import { roleAuth } from "../middleware/roleAuthMiddleware";
import { Roles } from "../config/Roles";
import { IReportController } from "../controllers/interfaces/IReportController";
import { authMiddleware } from "../middleware/authMiddleware";

export function createAdminRoutes(
  adminController: IAdminController,
  notificationController: INotificationController,
  contentModController: IContentModController,
  dashboardController: IDashboardController,
  subscriptionController: ISubscriptionController,
  reportController: IReportController,
) {
  const router = express.Router();

  // Admin routes
  router.post("/signIn", (req, res, next) => adminController.login(req, res, next));
  router.get("/fetchUsers", adminAuthMiddleware, roleAuth([Roles.ADMIN]), (req, res, next) =>
    adminController.fetchUsers(req, res, next)
  );
  router.patch("/blockUser/:userId", adminAuthMiddleware, roleAuth([Roles.ADMIN]), (req, res, next) =>
    adminController.blockUser(req, res, next)
  );

  // Notification route
  router.post("/notifications/create", adminAuthMiddleware, roleAuth([Roles.ADMIN]), (req, res, next) =>
    notificationController.createNotification(req, res, next)
  );

  // Content Moderation routes
  router.get("/reports", adminAuthMiddleware, roleAuth([Roles.ADMIN]), (req, res, next) =>
    contentModController.getReports(req, res, next)
  );
  router.post("/reports/:reportId/action", adminAuthMiddleware, roleAuth([Roles.ADMIN]), (req, res, next) =>
    contentModController.handleReportAction(req, res, next)
  );

  // Dashboard metrics routes
  router.get("/dashboard/metrics", adminAuthMiddleware, roleAuth([Roles.ADMIN]), (req, res, next) =>
    dashboardController.getDashboardMetrics(req, res, next)
  );
  router.get("/metrics/jobs", adminAuthMiddleware, roleAuth([Roles.ADMIN]), (req, res, next) =>
    dashboardController.getJobMetrics(req, res, next)
  );
  router.get("/metrics/network", adminAuthMiddleware, roleAuth([Roles.ADMIN]), (req, res, next) =>
    dashboardController.getNetworkMetrics(req, res, next)
  );
  router.get("/metrics/users", adminAuthMiddleware, roleAuth([Roles.ADMIN]), (req, res, next) =>
    dashboardController.getUserGrowthMetrics(req, res, next)
  );

  // Subscription routes
  router.get("/subscriptions", adminAuthMiddleware, roleAuth([Roles.ADMIN]), (req, res, next) =>
    subscriptionController.getSubscriptions(req, res, next)
  );
  router.get("/subscriptions/analytics", adminAuthMiddleware, roleAuth([Roles.ADMIN]), (req, res, next) =>
    subscriptionController.getAnalytics(req, res, next)
  );

  router.post('/reports/generate',authMiddleware,roleAuth([Roles.ADMIN]),(req,res,next)=>reportController.generateReport(req,res,next))
  // router.get('/reports/recent',authMiddleware,roleAuth([Roles.ADMIN]),(req,res,next)=>reportController.getRecentReports(req,res,next))
  

  return router;
}
