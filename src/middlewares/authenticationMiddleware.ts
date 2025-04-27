import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../types/http-status-codes";
import jwt from "jsonwebtoken";
import { User } from "../types/user";
import { config } from "dotenv";
import logger from "../utils/logger";
config();
const secretKey = process.env.JWT_SECRET;

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    logger.warn(`Authentication failed: No token provided. URL: ${req.originalUrl}`);
    throw new Error("Authentication required: " + HTTP_STATUS.AUTH_ERROR);
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    if (typeof decoded === "object" && decoded !== null) {
      req.user = decoded as User;
      logger.info(`Authentication successful for user: ${JSON.stringify(req.user)}. URL: ${req.originalUrl}`);
    } else {
      logger.warn(`Authentication failed: Invalid token format. URL: ${req.originalUrl}`);
      throw new Error("Invalid token: " + HTTP_STATUS.FORBIDDEN);
    }
    next();
  } catch (error) {
    logger.error(`Authentication failed: Invalid token. URL: ${req.originalUrl}. Error: ${error}`);
    throw new Error("Invalid token: " + HTTP_STATUS.FORBIDDEN);
  }
};
