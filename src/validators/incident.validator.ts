import { body, param } from 'express-validator';

export const validateCreateIncident = [
    body('reportedBy')
        .isString()
        .withMessage('ReportedBy must be a string')
        .notEmpty()
        .withMessage('ReportedBy is required'),
    body('deliveryId')
        .isString()
        .withMessage('DeliveryId must be a string')
        .notEmpty()
        .withMessage('DeliveryId is required'),
    body('type')
        .isString()
        .withMessage('Type must be a string')
        .notEmpty()
        .withMessage('Type is required'),
    body('description')
        .isString()
        .withMessage('Description must be a string')
        .notEmpty()
        .withMessage('Description is required'),
    body('status')
        .optional()
        .isString()
        .withMessage('Status must be a string'),
    body('location')
        .isString()
        .withMessage('Location must be a string')
        .notEmpty()
        .withMessage('Location is required'),
];

export const validateIncidentIdParam = [
    param('incidentId')
        .isString()
        .withMessage('Incident ID must be a string')
        .notEmpty()
        .withMessage('Incident ID is required'),
];

export const validateUpdateIncident = [
    body('reportedBy')
        .optional()
        .isString()
        .withMessage('ReportedBy must be a string'),
    body('deliveryId')
        .optional()
        .isString()
        .withMessage('DeliveryId must be a string'),
    body('type')
        .optional()
        .isString()
        .withMessage('Type must be a string'),
    body('description')
        .optional()
        .isString()
        .withMessage('Description must be a string'),
    body('status')
        .optional()
        .isString()
        .withMessage('Status must be a string'),
    body('location')
        .optional()
        .isString()
        .withMessage('Location must be a string'),
];
