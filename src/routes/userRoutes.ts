// src/routes/userRoutes.ts
import express from "express";
import { UserService } from "../services/userService";
import { OtpService } from "../services/otpService";
import { UserController } from "../controllers/userController";
import { UserRepository } from "../repositories/userRepository";
import { OtpRepository } from "../repositories/otpRepository";
import { AuthController } from "../controllers/authController";
import { s3Controller } from "../controllers/s3Controller";
import { s3Service } from "../services/s3Service";
import upload from "../middleware/multer-s3";
import { authMiddleware } from "../middleware/authMiddleware";
import { checkUserBlocked } from "../middleware/checkUserBlocked";
import { roleAuth } from "../middleware/roleAuthMiddleware";
import { UserProfileRepository } from "../repositories/userProfileRepository";
import { UserProfileService } from "../services/userProfileService";
import { UserProfileController } from "../controllers/userProfileController";
import { UserNetworkController } from "../controllers/UserNetworkController";
import { UserNetworkService } from "../services/UserNetworkService";
import { UserNetworkRepository } from "../repositories/UserNetworkRepository";
import { UserPaymentService } from "../services/UserPaymentServices";
import { UserPaymentController } from "../controllers/UserPaymentController";
import { UserPaymentRepository } from "../repositories/UserPaymentRepository";
import { UserMediaRepository } from "../repositories/UserMediaRepository";
import { UserMediaService } from "../services/UserMediaServices";
import { UserMediaController } from "../controllers/UserMediaController";
import { JobController } from "../controllers/JobsController";
import { JobService } from "../services/JobsService";
import { JobRepository } from "../repositories/JobsRepository";
import { JobApplicationRepository } from "../repositories/JobApplicationRepository";
import { JobApplicationService } from "../services/JobApplicationService";
import { JobApplicationController } from "../controllers/JobApplicationController";
import { getSocketIO } from "../config/socket";
import { NotificationSocketHandler } from "../sockets/NotificationSocketHandler";
import { NotificationService } from "../services/NotificationService";
import { NotificationController } from "../controllers/NotificationController";
import { NotificationRepository } from "../repositories/NotificationRepository";
import { ContentModRepository } from "../repositories/ContentModRepository";
import { ContentModService } from "../services/ContentModService";
import { ContentModController } from "../controllers/ContentModController";
import { ChatRepository } from "../repositories/ChatRepository";
import { ChatService } from "../services/ChatService";
import { ChatController } from "../controllers/ChatController";
import { Roles } from "../config/Roles";

const router = express.Router();

const userRepository = new UserRepository();
const otpRepository = new OtpRepository();
const userNetworkRepository = new UserNetworkRepository();
const userProfileRepository = new UserProfileRepository();
const userPaymentRepository = new UserPaymentRepository();
const userMediaRepository = new UserMediaRepository();
const userJobRepository = new JobRepository();
const jobApplicationRepository = new JobApplicationRepository();
const userJobService = new JobService(userJobRepository);
const userJobController = new JobController(userJobService);
const userProfileService = new UserProfileService(userProfileRepository);
const userProfileController = new UserProfileController(userProfileService);
const jobApplicationService = new JobApplicationService(
  jobApplicationRepository
);
const jobApplicationController = new JobApplicationController(
  jobApplicationService
);

const userService = new UserService(userRepository);
const otpService = new OtpService(otpRepository);
const s3service = new s3Service(userRepository);
const userPaymentService = new UserPaymentService(userPaymentRepository);

function createUserNotificationController() {
  const io = getSocketIO(); // Ensure socket.io instance is available
  const notificationSocketHandler = new NotificationSocketHandler(io);
  const userMediaService = new UserMediaService(
    userMediaRepository,
    notificationSocketHandler
  );
  return new UserMediaController(userMediaService);
}

// const userMediaService = new UserMediaService(userMediaRepository,notificationSocketHandler)
const userController = new UserController(userService, otpService);
const authController = new AuthController(userRepository);
const S3Controller = new s3Controller(s3service);
function createNetworkController() {
  const io = getSocketIO();
  const networkSocketHandler = new NotificationSocketHandler(io);
  const networkService = new UserNetworkService(
    userNetworkRepository,
    networkSocketHandler
  );
  return new UserNetworkController(networkService);
}
const userPaymentController = new UserPaymentController(userPaymentService);
// const userMediaController = new UserMediaController(userMediaService)

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

const contentModRepository = new ContentModRepository();
const contentModService = new ContentModService(contentModRepository);
const contentModController = new ContentModController(contentModService);

const chatRepository = new ChatRepository();
const chatService = new ChatService(chatRepository);
const chatController = new ChatController(chatService);

router.post("/signup", (req, res, next) =>
  userController.signup(req, res, next)
);
router.post("/verify-otp", (req, res, next) =>
  userController.verifyOtp(req, res, next)
);
router.get("/resend-otp", (req, res, next) =>
  userController.resendOtp(req, res, next)
);
router.post("/signIn", (req, res, next) =>
  authController.signIn(req, res, next)
);
router.post("/forget-password", (req, res, next) =>
  authController.requestPasswordReset(req, res, next)
);
router.post("/reset-password", (req, res, next) =>
  authController.resetPassword(req, res, next)
);
router.post("/Oauth-datasave", (req, res, next) =>
  userController.saveUser(req, res, next)
);
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
router.post("/refresh-token", (req, res, next) =>
  authController.refreshToken(req, res, next)
);
router.get(
  "/network/pending-requests/:userId",
  authMiddleware,
  roleAuth([Roles.USER, Roles.RECRUITER]),
  checkUserBlocked,
  (req, res, next) => {
    const userNetworkController = createNetworkController();
    return userNetworkController.getPendingRequests(req, res, next);
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
    const userNetworkController = createNetworkController();
    return userNetworkController.getSuggestions(req, res, next);
  }
);
router.post(
  "/network/connect/:userId",
  authMiddleware,
  roleAuth([Roles.USER, Roles.RECRUITER]),
  checkUserBlocked,
  (req, res, next) => {
    const userNetworkController = createNetworkController();
    return userNetworkController.connect(req, res, next);
  }
);
router.post(
  "/network/handle-request/:userId",
  authMiddleware,
  roleAuth([Roles.USER, Roles.RECRUITER]),
  checkUserBlocked,
  (req, res, next) => {
    const userNetworkController = createNetworkController();
    return userNetworkController.handleRequest(req, res, next);
  }
);
router.post(
  "/activity/new-post/:userId",
  authMiddleware,
  roleAuth([Roles.USER, Roles.RECRUITER]),
  checkUserBlocked,
  (req, res, next) => {
    const userMediaController = createUserNotificationController();
    return userMediaController.createPost(req, res, next);
  }
);
router.get(
  "/home/feeds/:userId",
  authMiddleware,
  roleAuth([Roles.USER, Roles.RECRUITER]),
  checkUserBlocked,
  (req, res, next) => {
    const userMediaController = createUserNotificationController();
    return userMediaController.fetchPosts(req, res, next);
  }
);
router.get(
  "/profile/activity/:userId",
  authMiddleware,
  roleAuth([Roles.USER, Roles.RECRUITER]),
  checkUserBlocked,
  (req, res, next) => userProfileController.fetchActivity(req, res, next)
);
router.get("/logout", authMiddleware, (req, res, next) =>
  authController.logout(req, res, next)
);
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
    const userMediaController = createUserNotificationController();
    return userMediaController.toggleLike(req, res, next);
  }
);
router.delete(
  "/Feeds/:postId/like/:userId",
  authMiddleware,
  roleAuth([Roles.USER, Roles.RECRUITER]),
  checkUserBlocked,
  (req, res, next) => {
    const userMediaController = createUserNotificationController();
    return userMediaController.toggleLike(req, res, next);
  }
);
router.post(
  "/Feeds/:postId/comment",
  authMiddleware,
  roleAuth([Roles.USER, Roles.RECRUITER]),
  checkUserBlocked,
  (req, res, next) => {
    const userMediaController = createUserNotificationController();
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
    const notificationController = createNotificationController();
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
    const notificationController = createNotificationController();
    return notificationController.getUserNotifications(req, res, next);
  }
);

router.get(
  "/FetchUserData/:id",
  authMiddleware,
  roleAuth([Roles.USER, Roles.RECRUITER]),
  checkUserBlocked,
  (req, res, next) => {
    const notificationController = createNotificationController();
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
    const userMediaController = createUserNotificationController();
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
  (req, res, next) =>
    jobApplicationController.getJobApplications(req, res, next)
);

router.get(
    "/jobs/recruiter/:recruiterId",
    authMiddleware,
    roleAuth([Roles.RECRUITER]),
    checkUserBlocked,
    (req, res, next) =>
      jobApplicationController.getRecruiterJobs(req, res, next)
  );

export default router;
