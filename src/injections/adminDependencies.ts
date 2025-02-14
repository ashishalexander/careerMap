// src/injections/adminDependencies.ts
import { AdminRepository } from "../repositories/adminRepository";
import { AdminService } from "../services/adminService";
import { AdminController } from "../controllers/adminController";

import { NotificationRepository } from "../repositories/NotificationRepository";
import { NotificationService } from "../services/NotificationService";
import { NotificationController } from "../controllers/NotificationController";
import { NotificationSocketHandler } from "../sockets/NotificationSocketHandler";

import { ContentModRepository } from "../repositories/ContentModRepository";
import { ContentModService } from "../services/ContentModService";
import { ContentModController } from "../controllers/ContentModController";

import { dashboardRepository } from "../repositories/dashboardRepository";
import { dashboardService } from "../services/dashboardService";
import { dashboardController } from "../controllers/dashboardController";

import { SubscriptionRepository } from "../repositories/adminSubscriptionRepository";
import { SubscriptionService } from "../services/adminSubscriptionService";
import { SubscriptionController } from "../controllers/adminSubscriptionController";
import { Server } from "socket.io";

// --- Admin Module ---
const adminRepository = new AdminRepository();
const adminService = new AdminService(adminRepository);
const adminController = new AdminController(adminService);

// --- Notification Module ---
function createNotificationController(io:Server): NotificationController {
  const notificationSocketHandler = new NotificationSocketHandler(io);
  // You can reuse an existing instance or create a new one
  const notificationRepository = new NotificationRepository();
  const notificationService = new NotificationService(notificationRepository, notificationSocketHandler);
  return new NotificationController(notificationService);
}

// --- Content Moderation Module ---
const contentModRepository = new ContentModRepository();
const contentModService = new ContentModService(contentModRepository);
const contentModController = new ContentModController(contentModService);

// --- Dashboard Module ---
const dashboardRepo = new dashboardRepository();
const dashboardSvc = new dashboardService(dashboardRepo);
const dashboardCtrl = new dashboardController(dashboardSvc);

// --- Subscription Module ---
const subscriptionRepo = new SubscriptionRepository();
const subscriptionSvc = new SubscriptionService(subscriptionRepo);
const subscriptionCtrl = new SubscriptionController(subscriptionSvc);

// Export all controller instances
export {
  adminController,
  createNotificationController,
  contentModController,
  dashboardCtrl,
  subscriptionCtrl
};
