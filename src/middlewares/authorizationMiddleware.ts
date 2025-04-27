import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../types/http-status-codes";
import { User } from "../types/user";
import logger from "../utils/logger";

export const authorize = (requiredRole: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      logger.warn(`Authorization failed: User not authenticated. URL: ${req.originalUrl}`);
      throw new Error("Not authenticated: " + HTTP_STATUS.AUTH_ERROR);
    }
    const { role } = req.user as User;
    if (!requiredRole.includes(role)) {
      logger.warn(
        `Authorization failed: User role '${role}' does not have access to '${req.originalUrl}'. Required roles: ${JSON.stringify(requiredRole)}`
      );
      throw new Error("Access denied: " + HTTP_STATUS.FORBIDDEN);
    }
    logger.info(`Authorization successful for user with role '${role}' on URL: ${req.originalUrl}`);
    next();
  };
};
