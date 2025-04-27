import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../types/http-status-codes";
import logger from "../utils/logger";

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors.array();
    logger.error(
      `Validation failed for request ${req.originalUrl}:`,
      errorDetails,
    );

    const error = new Error(JSON.stringify(errors.array()));
    (error as any).status = HTTP_STATUS.BAD_REQUEST;
    throw error;
  }
  next();
};
