import { Router } from 'express';
import {passwordController, userControllers} from '../controllers/index';
import { uploadS3 } from '../service/file-upload.service';
import { authenticate, authorize } from "../middlewares";

const router = Router();

/**
 * @swagger
 * /resetPassword/reset-password:
 *  post:
 *   description: Reset password
 *   tags: [User]
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       type: object
 *       properties:
 *        email:
 *         type: string
 *         format: email
 *        password:
 *         type: string
 *   responses:
 *    200:
 *     description: Route to reset the password
 *     content:
 *      application/json:
 *       schema:
 *        properties:
 *         token:
 *          type: string
 *    400:
 *     description: Bad request (missing parameter or invalid credentials)
 */
router.get('/reset-password', passwordController.serveResetPasswordForm);


export default router;