import { Router } from 'express';
import { routeSuggestionControllers } from '../controllers/index';
import { authenticate, authorize } from "../middlewares";

const router = Router();

/**
 * @swagger
 * components:
 *  schemas:
 *   RouteSuggestion:
 *    type: object
 *    required:
 *     - route
 *     - driverId
 *    properties:
 *     route:
 *      type: string
 *      description: The suggested route details
 *     driverId:
 *      type: string
 *      description: The ID of the driver who suggested the route
 *     createdAt:
 *      type: string
 *      format: date-time
 *      description: The time the route suggestion was created
 */

/**
 * @swagger
 * /routeSuggestion:
 *  post:
 *   description: Create a new route suggestion
 *   tags: [RouteSuggestion]
 *   security:
 *    - bearerAuth: []
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/components/schemas/RouteSuggestion'
 *   responses:
 *    201:
 *     description: Route suggestion created successfully
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 */
router.post('', authenticate, authorize(['admin', 'driver']), routeSuggestionControllers.create);

/**
 * @swagger
 * /routeSuggestion:
 *  get:
 *   description: Get all route suggestions
 *   tags: [RouteSuggestion]
 *   security:
 *    - bearerAuth: []
 *   responses:
 *    200:
 *     description: A list of route suggestions
 *     content:
 *      application/json:
 *       schema:
 *        type: array
 *        items:
 *         $ref: '#/components/schemas/RouteSuggestion'
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 */
router.get('', authenticate, authorize(['admin', 'driver', 'support', 'user']), routeSuggestionControllers.getAll);

/**
 * @swagger
 * /routeSuggestion/{routeSuggestionId}:
 *  get:
 *   description: Get a specific route suggestion by ID
 *   tags: [RouteSuggestion]
 *   security:
 *    - bearerAuth: []
 *   parameters:
 *    - name: routeSuggestionId
 *      in: path
 *      required: true
 *      schema:
 *       type: string
 *      description: The ID of the route suggestion
 *   responses:
 *    200:
 *     description: Route suggestion details
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/RouteSuggestion'
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 *    404:
 *     description: Route suggestion not found
 */
router.get('/:routeSuggestionId', authenticate, authorize(['admin', 'driver', 'support']), routeSuggestionControllers.getById);

/**
 * @swagger
 * /routeSuggestion/{routeSuggestionId}:
 *  put:
 *   description: Update a route suggestion by ID
 *   tags: [RouteSuggestion]
 *   security:
 *    - bearerAuth: []
 *   parameters:
 *    - name: routeSuggestionId
 *      in: path
 *      required: true
 *      schema:
 *       type: string
 *      description: The ID of the route suggestion
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/components/schemas/RouteSuggestion'
 *   responses:
 *    200:
 *     description: Route suggestion updated successfully
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 *    404:
 *     description: Route suggestion not found
 */
router.put('/:routeSuggestionId', authenticate, authorize(['admin', 'driver']), routeSuggestionControllers.update);

/**
 * @swagger
 * /routeSuggestion/{routeSuggestionId}:
 *  delete:
 *   description: Delete a route suggestion by ID
 *   tags: [RouteSuggestion]
 *   security:
 *    - bearerAuth: []
 *   parameters:
 *    - name: routeSuggestionId
 *      in: path
 *      required: true
 *      schema:
 *       type: string
 *      description: The ID of the route suggestion
 *   responses:
 *    200:
 *     description: Route suggestion deleted successfully
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 *    404:
 *     description: Route suggestion not found
 */
router.delete('/:routeSuggestionId', authenticate, authorize(['admin']), routeSuggestionControllers.delete);


/**
 * @swagger
 * /routeFromMap:
 *  post:
 *   description: Get a route from the map given the start and end points
 *   tags: [RouteSuggestion]
 *   security:
 *    - bearerAuth: []
 *   responses:
 *    200:
 *     description: The route given
 *     content:
 *      application/json:
 *       schema:
 *        type: array
 *        items:
 *         $ref: '#/components/schemas/RouteSuggestion'
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 */
//router.post('/routeFromMap', authenticate, authorize(['admin', 'driver', 'support', 'user']), routeSuggestionControllers.routeFromMap);
router.post('/routeFromMap', routeSuggestionControllers.routeFromMap);

export default router;
