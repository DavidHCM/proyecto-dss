import { Router } from 'express';
import { chatMessageControllers } from '../controllers/index';
import { authenticate, authorize, validateRequest } from "../middlewares";
import { validateCreateChatMessage, validateMessageIdParam, validateRoomNameParam, validateUpdateChatMessage } from '../validators/chatMessage.validator';
const router = Router();

/**
 * @swagger
 * components:
 *  schemas:
 *   ChatMessage:
 *    type: object
 *    required:
 *     - content
 *     - senderId
 *    properties:
 *     content:
 *      type: string
 *      description: The content of the message
 *     senderId:
 *      type: string
 *      description: The ID of the message sender
 *     timestamp:
 *      type: string
 *      format: date-time
 *      description: The time the message was sent
 */

/**
 * @swagger
 * /message:
 *  post:
 *   description: Create a new chat message
 *   tags: [Chat]
 *   security:
 *    - bearerAuth: []
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/components/schemas/ChatMessage'
 *   responses:
 *    201:
 *     description: Chat message created successfully
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 */
router.post('', authenticate, authorize(['user', 'admin', 'driver', 'support']),validateCreateChatMessage,validateRequest, chatMessageControllers.create);

/**
 * @swagger
 * /messages/:roomName:
 *  post:
 *   description: Get chat messages from a room
 *   tags: [Chat]
 *   security:
 *    - bearerAuth: []
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/components/schemas/ChatMessage'
 *   responses:
 *    201:
 *     description: Chat message fetch succesfull
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 */
router.get('/messages/:roomName', authenticate, authorize(['admin', 'driver', 'support']),validateRoomNameParam,validateRequest, chatMessageControllers.getMessagesByRoom);


/**
 * @swagger
 * /message:
 *  get:
 *   description: Get all chat messages
 *   tags: [Chat]
 *   security:
 *    - bearerAuth: []
 *   responses:
 *    200:
 *     description: A list of chat messages
 *     content:
 *      application/json:
 *       schema:
 *        type: array
 *        items:
 *         $ref: '#/components/schemas/ChatMessage'
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 */
router.get('', authenticate, authorize(['admin', 'user', 'driver', 'support']), chatMessageControllers.getAll);

/**
 * @swagger
 * /message/{messageId}:
 *  get:
 *   description: Get a specific chat message by ID
 *   tags: [Chat]
 *   security:
 *    - bearerAuth: []
 *   parameters:
 *    - name: messageId
 *      in: path
 *      required: true
 *      schema:
 *       type: string
 *      description: The ID of the message
 *   responses:
 *    200:
 *     description: Chat message details
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/ChatMessage'
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 *    404:
 *     description: Message not found
 */
router.get('/:messageId', authenticate, authorize(['admin', 'user', 'driver', 'support']),validateMessageIdParam,validateRequest, chatMessageControllers.getById);

/**
 * @swagger
 * /message/{messageId}:
 *  put:
 *   description: Update a chat message by ID
 *   tags: [Chat]
 *   security:
 *    - bearerAuth: []
 *   parameters:
 *    - name: messageId
 *      in: path
 *      required: true
 *      schema:
 *       type: string
 *      description: The ID of the message
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/components/schemas/ChatMessage'
 *   responses:
 *    200:
 *     description: Chat message updated successfully
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 *    404:
 *     description: Message not found
 */
router.put('/:messageId', authenticate, authorize(['admin', 'user', 'driver', 'support']),validateMessageIdParam,validateUpdateChatMessage,validateRequest, chatMessageControllers.update);

/**
 * @swagger
 * /message/{messageId}:
 *  delete:
 *   description: Delete a chat message by ID
 *   tags: [Chat]
 *   security:
 *    - bearerAuth: []
 *   parameters:
 *    - name: messageId
 *      in: path
 *      required: true
 *      schema:
 *       type: string
 *      description: The ID of the message
 *   responses:
 *    200:
 *     description: Chat message deleted successfully
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 *    404:
 *     description: Message not found
 */
router.delete('/:messageId', authenticate, authorize(['admin']),validateMessageIdParam,validateRequest, chatMessageControllers.delete);

export default router;
