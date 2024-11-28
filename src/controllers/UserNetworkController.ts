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

  async getSuggestions(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const { page = 1, search = "" } = req.query;
    const userId = req.params.userId; // Assuming authentication middleware adds `user` to the request.

    if (!userId) {
      return next(new CustomError("User is not authenticated", HttpStatusCodes.UNAUTHORIZED));
    }

    try {
      const suggestions = await this.networkService.getSuggestions(userId, Number(page), String(search));
      return res.status(HttpStatusCodes.OK).json({
        message: "Suggestions fetched successfully",
        data: suggestions,
      });
    } catch (error) {
      console.error("Error in UserNetworkController while fetching suggestions:", error);
      return next(new CustomError("Failed to fetch suggestions", HttpStatusCodes.INTERNAL_SERVER_ERROR));
    }
  }

  async connect(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const userId = req.params.userId; // User sending the connection request
    const { RequserId } = req.body; // User to connect with

    if (!userId || !RequserId) {
      return next(new CustomError("User ID and Requested User ID are required", HttpStatusCodes.BAD_REQUEST));
    }

    try {
      const result = await this.networkService.connect(userId, RequserId);
      if(result.success){
        return res.status(HttpStatusCodes.OK).json({
          message: result.message,
        });
      }else{
        throw new CustomError(result.message || "Unexpected error", HttpStatusCodes.INTERNAL_SERVER_ERROR);      }
    } catch (error) {
      return next(new CustomError("Error sending connection request", HttpStatusCodes.INTERNAL_SERVER_ERROR));
    }
  }

   async handleRequest(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const userId = req.params.userId; // Assuming userId is part of the request params
    const { requestId, action }: { requestId: string; action: 'accept' | 'reject' } = req.body;

    if (!userId || !requestId || !action) {
      return next(new CustomError("User ID, Request ID, and Action are required", HttpStatusCodes.BAD_REQUEST));
    }

    try {
      let result;
      
      if (action === "accept") {
        result = await this.networkService.acceptRequest(userId, requestId);
      } else if (action === "reject") {
        result = await this.networkService.rejectRequest(userId, requestId);
      }

      return res.status(HttpStatusCodes.OK).json({
        message: `Request ${action}ed successfully`,
        data: result,
      });
    } catch (error) {
      return next(new CustomError(`Error ${action}ing request`, HttpStatusCodes.INTERNAL_SERVER_ERROR));
    }
  }
}
