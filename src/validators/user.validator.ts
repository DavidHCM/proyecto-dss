import { body, param } from 'express-validator';

export const validateRegisterUser = [
    body('name').isString().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
];

export const validateUserIdParam = [
    param('userId').isString().notEmpty().withMessage('User ID is required'),
];

export const validateLogin = [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').notEmpty().withMessage('Password is required'),
];

export const validateUploadProfilePic = [
    body('file').custom((_, { req }) => {
        if (!req.file) {
            throw new Error('File is required');
        }
        return true;
    }),
];
