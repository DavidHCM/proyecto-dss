import { Request, Response } from 'express';
import Notification from './../models/notification.model';
import { HTTP_STATUS } from '../types/http-status-codes';
import { Notification as NotificationType } from '../types/notification';
import { userControllers } from "./user.controller";
import xss from 'xss';

class notificationController {
    async create(req: Request, res: Response) {
        try {
            const {
                notificationId,
                userId,
                message,
                type,
                status,
                createdAt
            }: NotificationType = req.body;

            const existingNotification = await Notification.findOne({ notificationId });

            if (existingNotification) {
                throw new Error('Notification already exists');
            }

            const newNotification = new Notification({
                notificationId,
                userId,
                message,
                type,
                status,
                createdAt
            });

            const savedNotification = await newNotification.save();
            res.status(HTTP_STATUS.SUCCESS).json(savedNotification);
        } catch (err) {
            console.error('Error creating notification:', err);
            res.status(HTTP_STATUS.BAD_REQUEST).send({
                message: xss('Error creating notification'),
            });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const results = await Notification.find({}).sort({ createdAt: -1 });
            res.status(HTTP_STATUS.SUCCESS).json(results);
        } catch (err) {
            console.error('Error fetching all notifications:', err);
            res.status(HTTP_STATUS.NOT_FOUND).send({
                message: xss('No notifications found'),
            });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const notificationId = req.params.notificationId;
            const existingNotification = await Notification.findOne({ notificationId });
            if (!existingNotification) {
                throw new Error('Notification does not exist');
            }

            const sanitizedNotification = {
                ...existingNotification.toObject(),
                userId: xss(existingNotification.userId),
                message: xss(existingNotification.message),
                status: xss(existingNotification.status),
                createdAt: existingNotification.createdAt,
            };

            res.status(HTTP_STATUS.SUCCESS).json(sanitizedNotification);
        } catch (err) {
            console.error('Error fetching notification by ID:', err);
            res.status(HTTP_STATUS.NOT_FOUND).send({
                message: xss('Error fetching notification'),
            });
        }
    }

    async getForPerson(req: Request, res: Response) {
        try {
            const userId = req.query.userId;

            const existingNotification = await Notification.find({ userId });
            if (!existingNotification || existingNotification.length === 0) {
                throw new Error('No notifications found for this user');
            }
            const user = await userControllers.getId(userId);

            res.status(HTTP_STATUS.SUCCESS).json({ notification: existingNotification, user: user });
        } catch (err) {
            console.error('Error fetching notifications for person:', err);
            res.status(HTTP_STATUS.NOT_FOUND).send({
                message: xss('Error fetching notifications for person'),
            });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const notificationId = req.params.notificationId;
            const updatedData = req.body;

            const existingNotification = await Notification.findOne({ notificationId });

            if (!existingNotification) {
                throw new Error('Notification does not exist');
            }

            const updatedNotification = await Notification.findOneAndUpdate(
                { notificationId },
                updatedData,
                { new: true, runValidators: true }
            );

            res.status(HTTP_STATUS.SUCCESS).json(updatedNotification);
        } catch (err) {
            console.error('Error updating notification:', err);
            res.status(HTTP_STATUS.BAD_REQUEST).send({
                message: xss('Error updating notification'),
            });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const notificationId = req.params.notificationId;
            const existingNotification = await Notification.findOne({ notificationId });

            if (!existingNotification) {
                throw new Error('Notification does not exist');
            }

            const deletedNotification = await Notification.deleteOne({ notificationId });
            res.status(HTTP_STATUS.SUCCESS).json(deletedNotification);
        } catch (err) {
            console.error('Error deleting notification:', err);
            res.status(HTTP_STATUS.BAD_REQUEST).send({
                message: xss('Error deleting notification'),
            });
        }
    }

    async saveFromSocket(notificationData: NotificationType) {
        try {
            const {
                notificationId,
                userId,
                message,
                type,
                status,
                createdAt
            } = notificationData;

            const existingNotification = await Notification.findOne({ notificationId });

            if (existingNotification) {
                throw new Error('Notification already exists');
            }

            const newNotification = new Notification({
                notificationId,
                userId,
                message,
                type,
                status,
                createdAt
            });

            const savedNotification = await newNotification.save();

            return savedNotification;
        } catch (err) {
            console.error('Error saving notification from socket:', err);
            throw new Error('Error saving notification');
        }
    }
}

export const notificationControllers = new notificationController();