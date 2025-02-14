import { Server } from "socket.io";
import { UserRepository } from "../repositories/userRepository";
import { OtpRepository } from "../repositories/otpRepository";
import { UserService } from "../services/userService";
import { OtpService } from "../services/otpService";
import { UserController } from "../controllers/userController";
import { AuthController } from "../controllers/authController";
import { s3Service } from "../services/s3Service";
import { s3Controller } from "../controllers/s3Controller";
import { UserProfileRepository } from "../repositories/userProfileRepository";
import { UserProfileService } from "../services/userProfileService";
import { UserProfileController } from "../controllers/userProfileController";
import { UserNetworkRepository } from "../repositories/UserNetworkRepository";
import { UserNetworkService } from "../services/UserNetworkService";
import { UserNetworkController } from "../controllers/UserNetworkController";
import { UserPaymentRepository } from "../repositories/UserPaymentRepository";
import { UserPaymentService } from "../services/UserPaymentServices";
import { UserPaymentController } from "../controllers/UserPaymentController";
import { UserMediaRepository } from "../repositories/UserMediaRepository";
import { UserMediaService } from "../services/UserMediaServices";
import { UserMediaController } from "../controllers/UserMediaController";
import { JobRepository } from "../repositories/JobsRepository";
import { JobService } from "../services/JobsService";
import { JobController } from "../controllers/JobsController";
import { JobApplicationRepository } from "../repositories/JobApplicationRepository";
import { JobApplicationService } from "../services/JobApplicationService";
import { JobApplicationController } from "../controllers/JobApplicationController";
import { NotificationRepository } from "../repositories/NotificationRepository";
import { NotificationSocketHandler } from "../sockets/NotificationSocketHandler";
import { NotificationService } from "../services/NotificationService";
import { NotificationController } from "../controllers/NotificationController";
import { ContentModRepository } from "../repositories/ContentModRepository";
import { ContentModService } from "../services/ContentModService";
import { ContentModController } from "../controllers/ContentModController";
import { ChatRepository } from "../repositories/ChatRepository";
import { ChatService } from "../services/ChatService";
import { ChatController } from "../controllers/ChatController";

// Instantiate dependencies that don't depend on socket
const userRepository = new UserRepository();
const otpRepository = new OtpRepository();
const userService = new UserService(userRepository);
const otpService = new OtpService(otpRepository);
const userController = new UserController(userService, otpService);

const authController = new AuthController(userRepository);

const s3service = new s3Service(userRepository);
const S3Controller = new s3Controller(s3service);

const userProfileRepository = new UserProfileRepository();
const userProfileService = new UserProfileService(userProfileRepository);
const userProfileController = new UserProfileController(userProfileService);

const userPaymentRepository = new UserPaymentRepository();
const userPaymentService = new UserPaymentService(userPaymentRepository);
const userPaymentController = new UserPaymentController(userPaymentService);

const jobRepository = new JobRepository();
const jobService = new JobService(jobRepository);
const userJobController = new JobController(jobService);

const jobApplicationRepository = new JobApplicationRepository();
const jobApplicationService = new JobApplicationService(jobApplicationRepository);
const jobApplicationController = new JobApplicationController(jobApplicationService);

const contentModRepository = new ContentModRepository();
const contentModService = new ContentModService(contentModRepository);
const contentModController = new ContentModController(contentModService);

const chatRepository = new ChatRepository();
const chatService = new ChatService(chatRepository);
const chatController = new ChatController(chatService);

const notificationRepository = new NotificationRepository();

// For controllers that require Socket.IO, create factory functions:
const userNetworkRepository = new UserNetworkRepository();
export function createNetworkController(io: Server): UserNetworkController {
  const networkSocketHandler = new NotificationSocketHandler(io);
  const networkService = new UserNetworkService(userNetworkRepository, networkSocketHandler);
  return new UserNetworkController(networkService);
}

const userMediaRepository = new UserMediaRepository();
export function createUserNotificationController(io: Server): UserMediaController {
  const notificationSocketHandler = new NotificationSocketHandler(io);
  const userMediaService = new UserMediaService(userMediaRepository, notificationSocketHandler);
  return new UserMediaController(userMediaService);
}

export function createNotificationController(io: Server): NotificationController {
  const notificationSocketHandler = new NotificationSocketHandler(io);
  const notificationService = new NotificationService(notificationRepository, notificationSocketHandler);
  return new NotificationController(notificationService);
}

// Export all instantiated controllers that don't need socket injection:
export {
  userController,
  authController,
  S3Controller,
  userProfileController,
  userPaymentController,
  userJobController,
  jobApplicationController,
  contentModController,
  chatController,
};
