import { Router } from 'express';
import { notificationControllers } from '../controllers/index';
import { authenticate, authorize, validateRequest } from "../middlewares";
import { validateCreateNotification, validateNotificationIdParam, validateUpdateNotification } from '../validators/notification.validator';

const router = Router();

/**
 * @swagger
 * components:
 *  schemas:
 *   Notification:
 *    type: object
 *    required:
 *     - title
 *     - message
 *    properties:
 *     title:
 *      type: string
 *      description: The title of the notification
 *     message:
 *      type: string
 *      description: The content of the notification
 *     createdAt:
 *      type: string
 *      format: date-time
 *      description: The time the notification was created
 *     read:
 *      type: boolean
 *      description: Whether the notification has been read
 */

/**
 * @swagger
 * /notification:
 *  post:
 *   description: Create a new notification
 *   tags: [Notification]
 *   security:
 *    - bearerAuth: []
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/components/schemas/Notification'
 *   responses:
 *    201:
 *     description: Notification created successfully
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 */
router.post('', authenticate, authorize(['admin']),validateCreateNotification,validateRequest, notificationControllers.create);

/**
 * @swagger
 * /notification:
 *  get:
 *   description: Get all notifications
 *   tags: [Notification]
 *   security:
 *    - bearerAuth: []
 *   responses:
 *    200:
 *     description: A list of notifications
 *     content:
 *      application/json:
 *       schema:
 *        type: array
 *        items:
 *         $ref: '#/components/schemas/Notification'
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 */
router.get('', authenticate, authorize(['admin', 'support', 'driver', 'user']), notificationControllers.getAll);

/**
 * @swagger
 * /notification:
 *  get:
 *   description: Get all notifications by user
 *   tags: [Notification]
 *   security:
 *    - bearerAuth: []
 *   responses:
 *    200:
 *     description: A list of notifications of user
 *     content:
 *      application/json:
 *       schema:
 *        type: array
 *        items:
 *         $ref: '#/components/schemas/Notification'
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 */
router.get('/byUser', authenticate, authorize(['admin', 'support', 'driver', 'user']), notificationControllers.getForPerson);

/**
 * @swagger
 * /notification/{notificationId}:
 *  get:
 *   description: Get a specific notification by ID
 *   tags: [Notification]
 *   security:
 *    - bearerAuth: []
 *   parameters:
 *    - name: notificationId
 *      in: path
 *      required: true
 *      schema:
 *       type: string
 *      description: The ID of the notification
 *   responses:
 *    200:
 *     description: Notification details
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/Notification'
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 *    404:
 *     description: Notification not found
 */
router.get('/:notificationId', authenticate, authorize(['admin', 'support', 'user', 'driver']),validateNotificationIdParam,validateRequest, notificationControllers.getById);

/**
 * @swagger
 * /notification/{notificationId}:
 *  put:
 *   description: Update a notification by ID
 *   tags: [Notification]
 *   security:
 *    - bearerAuth: []
 *   parameters:
 *    - name: notificationId
 *      in: path
 *      required: true
 *      schema:
 *       type: string
 *      description: The ID of the notification
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/components/schemas/Notification'
 *   responses:
 *    200:
 *     description: Notification updated successfully
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 *    404:
 *     description: Notification not found
 */
router.put('/:notificationId', authenticate, authorize(['admin']),validateNotificationIdParam,validateUpdateNotification,validateRequest, notificationControllers.update);

/**
 * @swagger
 * /notification/{notificationId}:
 *  delete:
 *   description: Delete a notification by ID
 *   tags: [Notification]
 *   security:
 *    - bearerAuth: []
 *   parameters:
 *    - name: notificationId
 *      in: path
 *      required: true
 *      schema:
 *       type: string
 *      description: The ID of the notification
 *   responses:
 *    200:
 *     description: Notification deleted successfully
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 *    404:
 *     description: Notification not found
 */
router.delete('/:notificationId', authenticate, authorize(['admin']),validateNotificationIdParam,validateRequest, notificationControllers.delete);

export default router;
