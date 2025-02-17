import { body, param } from 'express-validator';

export const validateCreateRanking = [
    body('points')
        .isNumeric()
        .withMessage('Points must be a number')
        .notEmpty()
        .withMessage('Points are required'),
    body('userId')
        .isString()
        .withMessage('User ID must be a string')
        .notEmpty()
        .withMessage('User ID is required'),
    body('rank')
        .optional()
        .isNumeric()
        .withMessage('Rank must be a number'),
];

export const validateRankingIdParam = [
    param('rankingId')
        .isString()
        .withMessage('Ranking ID must be a string')
        .notEmpty()
        .withMessage('Ranking ID is required'),
];

export const validateUpdateRanking = [
    body('points')
        .optional()
        .isNumeric()
        .withMessage('Points must be a number'),
    body('userId')
        .optional()
        .isString()
        .withMessage('User ID must be a string'),
    body('rank')
        .optional()
        .isNumeric()
        .withMessage('Rank must be a number'),
];
