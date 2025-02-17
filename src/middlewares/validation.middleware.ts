import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import {HTTP_STATUS} from "../types/http-status-codes";

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error(JSON.stringify(errors.array()));
        (error as any).status = HTTP_STATUS.BAD_REQUEST;
        throw error;
    }
    next();
};

