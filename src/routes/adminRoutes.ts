// src/routes/adminRoutesFactory.ts
import express from "express";
import { IAdminController } from "../controllers/interfaces/IadminController";
import { INotificationController } from "../controllers/interfaces/INotificationController";
import { IContentModController } from "../controllers/interfaces/IContentModController";
import { IDashboardController } from "../controllers/interfaces/IdashboardController";
import { ISubscriptionController } from "../controllers/interfaces/IadminSubCtrl";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleAuth } from "../middleware/roleAuthMiddleware";
import { Roles } from "../config/Roles";

export function createAdminRoutes(
  adminController: IAdminController,
  notificationController: INotificationController,
  contentModController: IContentModController,
  dashboardController: IDashboardController,
  subscriptionController: ISubscriptionController
) {
  const router = express.Router();

  // Admin routes
  router.post("/signIn", (req, res, next) => adminController.login(req, res, next));
  router.get("/fetchUsers", authMiddleware, roleAuth([Roles.ADMIN]), (req, res, next) =>
    adminController.fetchUsers(req, res, next)
  );
  router.patch("/blockUser/:userId", authMiddleware, roleAuth([Roles.ADMIN]), (req, res, next) =>
    adminController.blockUser(req, res, next)
  );

  // Notification route
  router.post("/notifications/create", authMiddleware, roleAuth([Roles.ADMIN]), (req, res, next) =>
    notificationController.createNotification(req, res, next)
  );

  // Content Moderation routes
  router.get("/reports", authMiddleware, roleAuth([Roles.ADMIN]), (req, res, next) =>
    contentModController.getReports(req, res, next)
  );
  router.post("/reports/:reportId/action", authMiddleware, roleAuth([Roles.ADMIN]), (req, res, next) =>
    contentModController.handleReportAction(req, res, next)
  );

  // Dashboard metrics routes
  router.get("/dashboard/metrics", authMiddleware, roleAuth([Roles.ADMIN]), (req, res, next) =>
    dashboardController.getDashboardMetrics(req, res, next)
  );
  router.get("/metrics/jobs", authMiddleware, roleAuth([Roles.ADMIN]), (req, res, next) =>
    dashboardController.getJobMetrics(req, res, next)
  );
  router.get("/metrics/network", authMiddleware, roleAuth([Roles.ADMIN]), (req, res, next) =>
    dashboardController.getNetworkMetrics(req, res, next)
  );
  router.get("/metrics/users", authMiddleware, roleAuth([Roles.ADMIN]), (req, res, next) =>
    dashboardController.getUserGrowthMetrics(req, res, next)
  );

  // Subscription routes
  router.get("/subscriptions", authMiddleware, roleAuth([Roles.ADMIN]), (req, res, next) =>
    subscriptionController.getSubscriptions(req, res, next)
  );
  router.get("/subscriptions/analytics", authMiddleware, roleAuth([Roles.ADMIN]), (req, res, next) =>
    subscriptionController.getAnalytics(req, res, next)
  );

  return router;
}
