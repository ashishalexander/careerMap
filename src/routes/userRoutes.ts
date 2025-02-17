import express from "express";
import { IAuthController } from "../controllers/interfaces/IauthController";
import { IUserController } from "../controllers/interfaces/IuserController";
import { IS3Controller } from "../controllers/interfaces/Is3Controller";
import { IUserProfileController } from "../controllers/interfaces/IUserProfileController";
import { IUserNetworkController } from "../controllers/interfaces/IUserNetworkController";
import { IUserPaymentController } from "../controllers/interfaces/IUserPaymentController";
import { IUserMediaController } from "../controllers/interfaces/IUserMediaController";
import { IJobController } from "../controllers/interfaces/IJobsController";
import { IJobApplicationController } from "../controllers/interfaces/IJobApplicationController";
import { INotificationController } from "../controllers/interfaces/INotificationController";
import { IContentModController } from "../controllers/interfaces/IContentModController";
import { IChatController } from "../controllers/interfaces/IChatController";
import { authMiddleware } from "../middleware/authMiddleware";
import { checkUserBlocked } from "../middleware/checkUserBlocked";
import { roleAuth } from "../middleware/roleAuthMiddleware";
import { Roles } from "../config/Roles";
import upload from "../middleware/multer-s3";
import { Server } from "socket.io";

export function createUserRoutes(
  userController: IUserController,
  authController: IAuthController,
  S3Controller: IS3Controller,
  userProfileController: IUserProfileController,
  createNetworkController: (io:Server) => IUserNetworkController,
  userPaymentController: IUserPaymentController,
  createUserNotificationController: (io: Server) => IUserMediaController,
  userJobController: IJobController,
  jobApplicationController: IJobApplicationController,
  createNotificationController: (io: Server) => INotificationController,
  contentModController: IContentModController,
  chatController: IChatController,
  io: Server // pass the initialized Socket.IO instance
) {
  const router = express.Router();

  // Registration & Authentication
  router.post("/signup", (req, res, next) => userController.signup(req, res, next));
  router.post("/verify-otp", (req, res, next) => userController.verifyOtp(req, res, next));
  router.get("/resend-otp", (req, res, next) => userController.resendOtp(req, res, next));
  router.post("/signIn", (req, res, next) => authController.signIn(req, res, next));
  router.post("/forget-password", (req, res, next) => authController.requestPasswordReset(req, res, next));
  router.post("/reset-password", (req, res, next) => authController.resetPassword(req, res, next));
  router.post("/Oauth-datasave", (req, res, next) => userController.saveUser(req, res, next));

  // File uploads for profile
  router.post(
    "/upload-profile-avatar/:userId",
    authMiddleware,
    roleAuth([Roles.USER, Roles.RECRUITER]),
    upload.single("file"),
    checkUserBlocked,
    (req, res, next) => S3Controller.uploadProfilePicture(req, res, next)
  );
  router.post(
    "/upload-profile-banner/:userId",
    authMiddleware,
    roleAuth([Roles.USER, Roles.RECRUITER]),
    upload.single("file"),
    checkUserBlocked,
    (req, res, next) => S3Controller.uploadBannerImage(req, res, next)
  );

  // Profile routes
  router.post(
    "/profile/info/:userId",
    authMiddleware,
    roleAuth([Roles.USER, Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => userProfileController.updateProfile(req, res, next)
  );
  router.post(
    "/profile/about/:userId",
    authMiddleware,
    roleAuth([Roles.USER, Roles.RECRUITER]),
    (req, res, next) => userProfileController.updateAbout(req, res, next)
  );
  router.post(
    "/profile/education/:userId",
    authMiddleware,
    roleAuth([Roles.USER, Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => userProfileController.AddEducation(req, res, next)
  );
  router.put(
    "/profile/education-update/:educationId/:userId",
    authMiddleware,
    roleAuth([Roles.USER, Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => userProfileController.updateEducation(req, res, next)
  );
  router.post(
    "/profile/experience/:userId",
    authMiddleware,
    roleAuth([Roles.USER, Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => userProfileController.addExperience(req, res, next)
  );
  router.put(
    "/profile/experience/:userId/:experienceId",
    roleAuth([Roles.USER, Roles.RECRUITER]),
    authMiddleware,
    checkUserBlocked,
    (req, res, next) => userProfileController.updateExperience(req, res, next)
  );
  router.delete(
    "/delete-profile/:userId",
    authMiddleware,
    roleAuth([Roles.USER, Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => S3Controller.deleteProfilePicture(req, res, next)
  );
  router.delete(
    "/delete/profile-education/:index/:userId",
    authMiddleware,
    roleAuth([Roles.USER, Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => userProfileController.deleteEducation(req, res, next)
  );
  router.delete(
    "/delete/profile-experience/:userId/:experienceId",
    authMiddleware,
    roleAuth([Roles.USER, Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => userProfileController.deleteExperience(req, res, next)
  );
  
  router.post("/refresh-token", (req, res, next) => authController.refreshToken(req, res, next));

  // Network routes
  router.get(
    "/network/pending-requests/:userId",
    authMiddleware,
    roleAuth([Roles.USER, Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => {
      const networkController = createNetworkController(io);
      return networkController.getPendingRequests(req, res, next);
    }
  );


  router.post(
    "/premium/create-order/",
    authMiddleware,
    roleAuth([Roles.USER, Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => userPaymentController.createOrder(req, res, next)
  );
  router.post(
    "/premium/verify-payment/",
    authMiddleware,
    roleAuth([Roles.USER, Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => userPaymentController.verifyPayment(req, res, next)
  );

  
  router.get(
    "/network/suggestions/:userId",
    authMiddleware,
    roleAuth([Roles.USER, Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => {
      const networkController = createNetworkController(io);
      return networkController.getSuggestions(req, res, next);
    }
  );
  router.post(
    "/network/connect/:userId",
    authMiddleware,
    roleAuth([Roles.USER, Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => {
      const networkController = createNetworkController(io);
      return networkController.connect(req, res, next);
    }
  );
  router.post(
    "/network/handle-request/:userId",
    authMiddleware,
    roleAuth([Roles.USER, Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => {
      const networkController = createNetworkController(io);
      return networkController.handleRequest(req, res, next);
    }
  );

  // Activity and Media routes
  router.post(
    "/activity/new-post/:userId",
    authMiddleware,
    roleAuth([Roles.USER, Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => {
      const userMediaController = createUserNotificationController(io);
      return userMediaController.createPost(req, res, next);
    }
  );
  router.get(
    "/home/feeds/:userId",
    authMiddleware,
    roleAuth([Roles.USER, Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => {
      const userMediaController = createUserNotificationController(io);
      return userMediaController.fetchPosts(req, res, next);
    }
  );

  // Jobs, Notifications, etc.
  router.get(
    "/profile/activity/:userId",
    authMiddleware,
    roleAuth([Roles.USER, Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => userProfileController.fetchActivity(req, res, next)
  );
  router.get("/logout", authMiddleware, (req, res, next) => authController.logout(req, res, next));
  router.post(
    "/activity/JobPost/:userId",
    authMiddleware,
    roleAuth([Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => userJobController.createJob(req, res, next)
  );
  router.get(
    "/jobs/:userId",
    authMiddleware,
    roleAuth([Roles.USER, Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => userJobController.fetchAllJobs(req, res, next)
  );
  router.get(
    "/recruiter/Jobpost/:userId",
    authMiddleware,
    roleAuth([Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => userProfileController.recruiterJobPosts(req, res, next)
  );
  router.delete(
    "/recruiter/:JobId/:userId",
    authMiddleware,
    roleAuth([Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => userJobController.deleteJob(req, res, next)
  );
  router.put(
    "/activity/JobPost/:JobId",
    authMiddleware,
    roleAuth([Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => userJobController.updateJob(req, res, next)
  );
  router.post(
    "/Feeds/:postId/like/:userId",
    authMiddleware,
    roleAuth([Roles.USER, Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => {
      const userMediaController = createUserNotificationController(io);
      return userMediaController.toggleLike(req, res, next);
    }
  );
  router.delete(
    "/Feeds/:postId/like/:userId",
    authMiddleware,
    roleAuth([Roles.USER, Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => {
      const userMediaController = createUserNotificationController(io);
      return userMediaController.toggleLike(req, res, next);
    }
  );
  router.post(
    "/Feeds/:postId/comment",
    authMiddleware,
    roleAuth([Roles.USER, Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => {
      const userMediaController = createUserNotificationController(io);
      return userMediaController.addComment(req, res, next);
    }
  );
  router.get(
    "/jobsById/:JobId",
    authMiddleware,
    roleAuth([Roles.USER]),
    checkUserBlocked,
    (req, res, next) => userJobController.fetchJob(req, res, next)
  );
  router.post(
    "/application/submit/:jobId/:userId",
    authMiddleware,
    roleAuth([Roles.USER]),
    checkUserBlocked,
    upload.single("Resumes"),
    (req, res, next) => jobApplicationController.applyForJob(req, res, next)
  );
  router.get(
    "/isApplied/:userId/:jobId",
    authMiddleware,
    roleAuth([Roles.USER]),
    checkUserBlocked,
    (req, res, next) => jobApplicationController.hasApplied(req, res, next)
  );
  router.get(
    "/fetch/existingNotifications",
    authMiddleware,
    roleAuth([Roles.USER, Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => {
      const notificationController = createNotificationController(io);
      return notificationController.getAllNotifications(req, res, next);
    }
  );
  router.post(
    "/posts/report",
    authMiddleware,
    roleAuth([Roles.USER, Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => contentModController.createReport(req, res, next)
  );
  router.get(
    "/fetch/userNotifications/:userId",
    authMiddleware,
    roleAuth([Roles.USER, Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => {
      const notificationController = createNotificationController(io);
      return notificationController.getUserNotifications(req, res, next);
    }
  );
  router.get(
    "/FetchUserData/:id",
    authMiddleware,
    roleAuth([Roles.USER, Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => {
      const notificationController = createNotificationController(io);
      return notificationController.getUserById(req, res, next);
    }
  );
  router.get(
    "/profile/:userId",
    authMiddleware,
    roleAuth([Roles.USER, Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => userProfileController.getUserProfile(req, res, next)
  );
  router.get(
    "/posts/:userId",
    authMiddleware,
    roleAuth([Roles.USER, Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => {
      const userMediaController = createUserNotificationController(io);
      return userMediaController.getUserPosts(req, res, next);
    }
  );
  router.get(
    "/chat/connected-users/:userId",
    authMiddleware,
    roleAuth([Roles.USER, Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => chatController.getConnectedUsers(req, res, next)
  );
  router.get(
    "/chat/rooms/:userId",
    authMiddleware,
    roleAuth([Roles.USER, Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => chatController.getChatRooms(req, res, next)
  );
  router.post(
    "/chat/rooms/:userId",
    authMiddleware,
    roleAuth([Roles.USER, Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => chatController.createChatRoom(req, res, next)
  );
  router.get(
    "/chat/rooms/:roomId/messages/:userId",
    authMiddleware,
    roleAuth([Roles.USER, Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => chatController.getChatHistory(req, res, next)
  );
  router.get(
    "/applications/job/:jobId",
    authMiddleware,
    roleAuth([Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => jobApplicationController.getJobApplications(req, res, next)
  );
  router.get(
    "/jobs/recruiter/:recruiterId",
    authMiddleware,
    roleAuth([Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) => jobApplicationController.getRecruiterJobs(req, res, next)
  );
  router.get(
    "/subscriptionData/:userId",
    authMiddleware,
    roleAuth([Roles.RECRUITER, Roles.USER]),
    checkUserBlocked,
    (req, res, next) => userController.getSubscriptionDetails(req, res, next)
  );

  return router;
}
