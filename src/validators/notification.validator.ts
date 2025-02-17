import { body, param } from 'express-validator';

export const validateCreateNotification = [
    body('title')
        .isString()
        .withMessage('Title must be a string')
        .notEmpty()
        .withMessage('Title is required'),
    body('message')
        .isString()
        .withMessage('Message must be a string')
        .notEmpty()
        .withMessage('Message is required'),
    body('userId')
        .optional()
        .isString()
        .withMessage('UserId must be a string'),
    body('type')
        .optional()
        .isString()
        .withMessage('Type must be a string'),
    body('status')
        .optional()
        .isString()
        .withMessage('Status must be a string'),
    body('createdAt')
        .optional()
        .isISO8601()
        .withMessage('CreatedAt must be a valid ISO 8601 date-time string'),
];

export const validateNotificationIdParam = [
    param('notificationId')
        .isString()
        .withMessage('Notification ID must be a string')
        .notEmpty()
        .withMessage('Notification ID is required'),
];

export const validateUpdateNotification = [
    body('title')
        .optional()
        .isString()
        .withMessage('Title must be a string'),
    body('message')
        .optional()
        .isString()
        .withMessage('Message must be a string'),
    body('userId')
        .optional()
        .isString()
        .withMessage('UserId must be a string'),
    body('type')
        .optional()
        .isString()
        .withMessage('Type must be a string'),
    body('status')
        .optional()
        .isString()
        .withMessage('Status must be a string'),
    body('createdAt')
        .optional()
        .isISO8601()
        .withMessage('CreatedAt must be a valid ISO 8601 date-time string'),
];
