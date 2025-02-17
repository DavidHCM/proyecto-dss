import { Router } from 'express';
import { deliveryControllers } from '../controllers/index';
import { authenticate, authorize, validateRequest } from "../middlewares";
import { validateCreateDelivery, validateDeliveryIdParam, validateGetByDate, validateUpdateDelivery} from '../validators/deliveries.validator';
const router = Router();

/**
 * @swagger
 * components:
 *  schemas:
 *   Delivery:
 *    type: object
 *    required:
 *     - address
 *     - deliveryDate
 *    properties:
 *     address:
 *      type: string
 *      description: The address where the delivery will be made
 *     deliveryDate:
 *      type: string
 *      format: date-time
 *      description: The scheduled delivery date
 *     status:
 *      type: string
 *      description: The status of the delivery
 */

/**
 * @swagger
 * /deliveries:
 *  post:
 *   description: Create a new delivery
 *   tags: [Deliveries]
 *   security:
 *    - bearerAuth: []
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/components/schemas/Delivery'
 *   responses:
 *    201:
 *     description: Delivery created successfully
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 */
router.post('', authenticate, authorize(['admin']),validateCreateDelivery,validateRequest, deliveryControllers.create);

/**
 * @swagger
 * /deliveries:
 *  get:
 *   description: Get by driver with query deliveries
 *   tags: [Deliveries]
 *   security:
 *    - bearerAuth: []
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/components/schemas/Delivery'
 *   responses:
 *    201:
 *     description: Delivery from driver
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 */
router.get('/byDriver', authenticate, authorize(['admin', 'driver']), deliveryControllers.getByDriver);

/**
 * @swagger
 * /deliveries/byDate:
 *  post:
 *   description: Get by date with body
 *   tags: [Deliveries]
 *   security:
 *    - bearerAuth: []
 *   responses:
 *    200:
 *     description: A list of deliveries by date
 *     content:
 *      application/json:
 *       schema:
 *        type: array
 *        items:
 *         $ref: '#/components/schemas/Delivery'
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 */
router.post('/byDate', authenticate, authorize(['admin', 'driver', 'user', 'support']),validateGetByDate,validateRequest, deliveryControllers.getByDate);


/**
 * @swagger
 * /deliveries:
 *  get:
 *   description: Get all deliveries
 *   tags: [Deliveries]
 *   security:
 *    - bearerAuth: []
 *   responses:
 *    200:
 *     description: A list of deliveries
 *     content:
 *      application/json:
 *       schema:
 *        type: array
 *        items:
 *         $ref: '#/components/schemas/Delivery'
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 */
router.get('', authenticate, authorize(['admin', 'driver', 'user', 'support']), deliveryControllers.getAll);

/**
 * @swagger
 * /deliveries/active:
 *  get:
 *   description: Get all active deliveries
 *   tags: [Deliveries]
 *   security:
 *    - bearerAuth: []
 *   responses:
 *    200:
 *     description: A list of active deliveries
 *     content:
 *      application/json:
 *       schema:
 *        type: array
 *        items:
 *         $ref: '#/components/schemas/Delivery'
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 */
router.get('/active', authenticate, authorize(['admin', 'driver', 'user', 'support']), deliveryControllers.getAllActive);

/**
 * @swagger
 * /deliveries/{deliveryId}:
 *  get:
 *   description: Get a specific delivery by ID
 *   tags: [Deliveries]
 *   security:
 *    - bearerAuth: []
 *   parameters:
 *    - name: deliveryId
 *      in: path
 *      required: true
 *      schema:
 *       type: string
 *      description: The ID of the delivery
 *   responses:
 *    200:
 *     description: Delivery details
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/Delivery'
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 *    404:
 *     description: Delivery not found
 */
router.get('/:deliveryId', authenticate, authorize(['admin', 'driver', 'user', 'support']),validateDeliveryIdParam,validateRequest, deliveryControllers.getById);

/**
 * @swagger
 * /deliveries/{deliveryId}:
 *  put:
 *   description: Update a delivery by ID
 *   tags: [Deliveries]
 *   security:
 *    - bearerAuth: []
 *   parameters:
 *    - name: deliveryId
 *      in: path
 *      required: true
 *      schema:
 *       type: string
 *      description: The ID of the delivery
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/components/schemas/Delivery'
 *   responses:
 *    200:
 *     description: Delivery updated successfully
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 *    404:
 *     description: Delivery not found
 */
router.put('/:deliveryId', authenticate, authorize(['admin', 'driver']),validateDeliveryIdParam,validateUpdateDelivery,validateRequest, deliveryControllers.update);

/**
 * @swagger
 * /deliveries/{deliveryId}:
 *  delete:
 *   description: Delete a delivery by ID
 *   tags: [Deliveries]
 *   security:
 *    - bearerAuth: []
 *   parameters:
 *    - name: deliveryId
 *      in: path
 *      required: true
 *      schema:
 *       type: string
 *      description: The ID of the delivery
 *   responses:
 *    200:
 *     description: Delivery deleted successfully
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 *    404:
 *     description: Delivery not found
 */
router.delete('/:deliveryId', authenticate, authorize(['admin']),validateDeliveryIdParam,validateRequest, deliveryControllers.delete);

export default router;
