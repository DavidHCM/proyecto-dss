import { body, param } from 'express-validator';

export const validateCreateDelivery = [
    body('assignedTo')
        .isUUID()
        .withMessage('AssignedTo must be a valid UUID')
        .notEmpty()
        .withMessage('AssignedTo is required'),
    body('pickupLocation')
        .isString()
        .withMessage('Pickup location must be a string')
        .notEmpty()
        .withMessage('Pickup location is required'),
    body('deliveryLocation')
        .isString()
        .withMessage('Delivery location must be a string')
        .notEmpty()
        .withMessage('Delivery location is required'),
    body('scheduledTime')
        .isISO8601()
        .withMessage('Scheduled time must be a valid ISO 8601 date-time string')
        .notEmpty()
        .withMessage('Scheduled time is required'),
    body('productDetails')
        .isObject()
        .withMessage('Product details must be an object')
        .notEmpty()
        .withMessage('Product details are required'),
    body('productDetails.name')
        .isString()
        .withMessage('Product name must be a string')
        .notEmpty()
        .withMessage('Product name is required'),
    body('productDetails.description')
        .isString()
        .withMessage('Product description must be a string')
        .notEmpty()
        .withMessage('Product description is required'),
    body('productDetails.quantity')
        .isInt({ min: 1 })
        .withMessage('Product quantity must be an integer greater than 0')
        .notEmpty()
        .withMessage('Product quantity is required'),
];

export const validateDeliveryIdParam = [
    param('deliveryId')
        .isString()
        .withMessage('Delivery ID must be a string')
        .notEmpty()
        .withMessage('Delivery ID is required'),
];

export const validateGetByDate = [
    body('startDate')
        .isISO8601()
        .withMessage('Start date must be a valid ISO 8601 date-time string')
        .notEmpty()
        .withMessage('Start date is required'),
    body('endDate')
        .isISO8601()
        .withMessage('End date must be a valid ISO 8601 date-time string')
        .notEmpty()
        .withMessage('End date is required'),
];

export const validateUpdateDelivery = [
    body('pickupLocation')
        .optional()
        .isString()
        .withMessage('Pickup location must be a string'),
    body('deliveryLocation')
        .optional()
        .isString()
        .withMessage('Delivery location must be a string'),
    body('scheduledTime')
        .optional()
        .isISO8601()
        .withMessage('Scheduled time must be a valid ISO 8601 date-time string'),
    body('productDetails')
        .optional()
        .isObject()
        .withMessage('Product details must be an object'),
    body('productDetails.name')
        .optional()
        .isString()
        .withMessage('Product name must be a string'),
    body('productDetails.description')
        .optional()
        .isString()
        .withMessage('Product description must be a string'),
    body('productDetails.quantity')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Product quantity must be an integer greater than 0'),
];
