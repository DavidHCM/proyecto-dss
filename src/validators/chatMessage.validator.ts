import { body, param } from 'express-validator';

export const validateCreateChatMessage = [
    body('messageId')
        .isString()
        .withMessage('Message ID must be a string')
        .notEmpty()
        .withMessage('Message ID is required'),
    body('fromUserId')
        .isString()
        .withMessage('FromUserId must be a string')
        .notEmpty()
        .withMessage('FromUserId is required'),
    body('toUserId')
        .isString()
        .withMessage('ToUserId must be a string')
        .notEmpty()
        .withMessage('ToUserId is required'),
    body('deliveryId')
        .isString()
        .withMessage('DeliveryId must be a string')
        .notEmpty()
        .withMessage('DeliveryId is required'),
    body('content')
        .isString()
        .withMessage('Content must be a string')
        .notEmpty()
        .withMessage('Content is required'),
    body('createdAt')
        .optional()
        .isISO8601()
        .withMessage('CreatedAt must be a valid ISO 8601 date-time string'),
];

export const validateMessageIdParam = [
    param('messageId')
        .isString()
        .withMessage('Message ID must be a string')
        .notEmpty()
        .withMessage('Message ID is required'),
];

export const validateRoomNameParam = [
    param('roomName')
        .isString()
        .withMessage('Room name must be a string')
        .notEmpty()
        .withMessage('Room name is required'),
];

export const validateUpdateChatMessage = [
    body('content')
        .optional()
        .isString()
        .withMessage('Content must be a string'),
    body('createdAt')
        .optional()
        .isISO8601()
        .withMessage('CreatedAt must be a valid ISO 8601 date-time string'),
];
