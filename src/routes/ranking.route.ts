import { Router } from 'express';
import { rankingControllers } from '../controllers/index';
import { authenticate, authorize, validateRequest } from "../middlewares";
import { validateCreateRanking, validateRankingIdParam, validateUpdateRanking } from '../validators/ranking.validator';
import {config} from "dotenv";
config();

const router = Router();

/**
 * @swagger
 * components:
 *  schemas:
 *   Ranking:
 *    type: object
 *    required:
 *     - score
 *     - userId
 *    properties:
 *     score:
 *      type: number
 *      description: The score of the ranking
 *     userId:
 *      type: string
 *      description: The ID of the user associated with the ranking
 *     createdAt:
 *      type: string
 *      format: date-time
 *      description: The time the ranking was created
 */

/**
 * @swagger
 * /ranking:
 *  post:
 *   description: Create a new ranking
 *   tags: [Ranking]
 *   security:
 *    - bearerAuth: []
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/components/schemas/Ranking'
 *   responses:
 *    201:
 *     description: Ranking created successfully
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 */
router.post('', authenticate, authorize(['admin']),validateCreateRanking, validateRequest,  rankingControllers.create);

/**
 * @swagger
 * /ranking:
 *  get:
 *   description: Get all rankings
 *   tags: [Ranking]
 *   security:
 *    - bearerAuth: []
 *   responses:
 *    200:
 *     description: A list of rankings
 *     content:
 *      application/json:
 *       schema:
 *        type: array
 *        items:
 *         $ref: '#/components/schemas/Ranking'
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 */
router.get('', authenticate, authorize(['admin', 'support', 'driver']), rankingControllers.getAll);

/**
 * @swagger
 * /ranking/{rankingId}:
 *  get:
 *   description: Get a specific ranking by ID
 *   tags: [Ranking]
 *   security:
 *    - bearerAuth: []
 *   parameters:
 *    - name: rankingId
 *      in: path
 *      required: true
 *      schema:
 *       type: string
 *      description: The ID of the ranking
 *   responses:
 *    200:
 *     description: Ranking details
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/Ranking'
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 *    404:
 *     description: Ranking not found
 */
router.get('/:rankingId', authenticate, authorize(['admin', 'support']), validateRankingIdParam, validateRequest, rankingControllers.getById);

/**
 * @swagger
 * /ranking/{rankingId}:
 *  put:
 *   description: Update a ranking by ID
 *   tags: [Ranking]
 *   security:
 *    - bearerAuth: []
 *   parameters:
 *    - name: rankingId
 *      in: path
 *      required: true
 *      schema:
 *       type: string
 *      description: The ID of the ranking
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/components/schemas/Ranking'
 *   responses:
 *    200:
 *     description: Ranking updated successfully
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 *    404:
 *     description: Ranking not found
 */
router.put('/:rankingId', authenticate, authorize(['admin']),validateRankingIdParam,validateUpdateRanking,validateRequest, rankingControllers.update);

/**
 * @swagger
 * /ranking/{rankingId}:
 *  delete:
 *   description: Delete a ranking by ID
 *   tags: [Ranking]
 *   security:
 *    - bearerAuth: []
 *   parameters:
 *    - name: rankingId
 *      in: path
 *      required: true
 *      schema:
 *       type: string
 *      description: The ID of the ranking
 *   responses:
 *    200:
 *     description: Ranking deleted successfully
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 *    404:
 *     description: Ranking not found
 */
router.delete('/:rankingId', authenticate, authorize(['admin']),validateRankingIdParam,validateRequest, rankingControllers.delete);

export default router;
