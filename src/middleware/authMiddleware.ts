import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { CustomError } from "../errors/customErrors";
import { generateAccessToken } from "../utils/tokenUtils";
import { IAuthTokenPayload } from "../interfaces/authTokenPayload";

interface CustomRequest extends Request {
  user?: IAuthTokenPayload;
}

export const authMiddleware = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    // Get access token
    const authHeader = req.headers["authorization"];
    const accessToken = authHeader?.split(" ")[1];

    // Get user refresh token (Path="/")
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken) {
      return next(new CustomError("Access denied. No access token provided.", 401));
    }

    try {
      // Verify access token
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET as string) as IAuthTokenPayload;
      req.user = decoded;
      return next();
    } catch (error) {
      console.log(error)
      // Access token expired, check refresh token
      if (!refreshToken) {
        return next(new CustomError("Session expired. Please login again.", 401));
      }

      try {
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as IAuthTokenPayload;
        
        // Generate new access token
        const newAccessToken = generateAccessToken({ _id: decoded._id, email: decoded.email, role: decoded.role });
        res.setHeader("New-Access-Token", newAccessToken);

        // Attach user to request
        req.user = decoded;
        return next();
      } catch (refreshError) {
        console.log(refreshError)
        return next(new CustomError("Invalid refresh token.", 403));
      }
    }
  } catch (error) {
    console.log(error)
    return next(new CustomError("Authentication failed.", 401));
  }
};

