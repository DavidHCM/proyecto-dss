import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../types/http-status-codes';
import jwt from 'jsonwebtoken';
import { User } from "../types/user";
import {config} from "dotenv";
config();
const secretKey = process.env.JWT_SECRET;

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        throw new Error('Authentication required: ' + HTTP_STATUS.AUTH_ERROR);
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        if (typeof decoded === 'object' && decoded !== null) {
            req.user = decoded as User;
        } else {
            throw new Error('Invalid token: ' + HTTP_STATUS.FORBIDDEN);
        }
        next();
    } catch (error) {
        throw new Error('Invalid token: ' + HTTP_STATUS.FORBIDDEN);
    }
};
