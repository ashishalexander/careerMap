import { Request, Response, NextFunction } from "express";
import { IUserNetworkService } from "../services/interfaces/IUserNetworkService";
import { CustomError } from "../errors/customErrors";
import { HttpStatusCodes } from "../config/HttpStatusCodes";

export class UserNetworkController {
  constructor(private networkService: IUserNetworkService) {}

  // Fetch pending connection requests
  async getPendingRequests(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const userId = req.params.userId; // Assuming userId is part of the request params

    if (!userId) {
      return next(new CustomError("User ID is required", HttpStatusCodes.BAD_REQUEST));
    }

    try {
      const pendingRequests = await this.networkService.getPendingRequests(userId);

      return res.status(HttpStatusCodes.OK).json({
        message: "Pending requests fetched successfully",
        data: pendingRequests,
      });
    } catch (error) {
      return next(new CustomError("Error fetching pending requests", HttpStatusCodes.INTERNAL_SERVER_ERROR));
    }
  }

//   // Approve a connection request
//   async approveRequest(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
//     const { userId, requestId } = req.params;

//     if (!userId || !requestId) {
//       return next(new CustomError("User ID and Request ID are required", HttpStatusCodes.BAD_REQUEST));
//     }

//     try {
//       const result = await this.networkService.approveRequest(userId, requestId);

//       return res.status(HttpStatusCodes.OK).json({
//         message: "Request approved successfully",
//         data: result,
//       });
//     } catch (error) {
//       return next(new CustomError("Error approving request", HttpStatusCodes.INTERNAL_SERVER_ERROR));
//     }
//   }

//   // Reject a connection request
//   async rejectRequest(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
//     const { userId, requestId } = req.params;

//     if (!userId || !requestId) {
//       return next(new CustomError("User ID and Request ID are required", HttpStatusCodes.BAD_REQUEST));
//     }

//     try {
//       const result = await this.networkService.rejectRequest(userId, requestId);

//       return res.status(HttpStatusCodes.OK).json({
//         message: "Request rejected successfully",
//         data: result,
//       });
//     } catch (error) {
//       return next(new CustomError("Error rejecting request", HttpStatusCodes.INTERNAL_SERVER_ERROR));
//     }
//   }
}
