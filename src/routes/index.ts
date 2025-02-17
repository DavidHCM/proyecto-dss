
import express, {Request, Response, NextFunction, Application} from "express";
import deliveriesRoutes from "./deliveries.routes";
import incidentsRoutes from "./incidents.routes";
import routeSuggestionRoutes from "./routeSuggestion.route";
import userRoutes from "./user.route";
import rankingRoutes from "./ranking.route";
import notificationRoute from "./notification.route";
import chatMessageRoute from "./chatMessage.route";
import passwordReset from "./passwordReset.route";

import { googleAuth } from '../middlewares/google-auth';
import googleAuthRoutes from '../routes/googleAuth.routes';

import { authenticate, authorize } from "../middlewares";
const router = express.Router();
import { HTTP_STATUS } from "../types/http-status-codes";
import {config} from "dotenv";
config();


router.use(express.json());


const app: Application = express();
googleAuth(app);
router.use(express.json());





/**
 * @swagger
 * components:
 *  securitySchemes:
 *    bearerAuth:
 *      type: http
 *      scheme: bearer
 *      bearerFormat: JWT
 *
 * security:
 *  - bearerAuth: []
 */

/**
 * @swagger
 * /:
 *  get:
 *   tags: [Default]
 *   description: Api home endpoint
 *   responses:
 *    '200':
 *      description: Api is running
 */
router.get("/", (req, res) => {
    res.send("Api is running");
});

/**
 * @swagger
 * tags:
 *  name: Deliveries
 *  description: Deliveries management
 */
router.use("/deliveries", deliveriesRoutes);

/**
 * @swagger
 * tags:
 *  name: Incident
 *  description: Incidents management
 */
router.use("/incident", incidentsRoutes);

/**
 * @swagger
 * tags:
 *  name: RouteSuggestion
 *  description: Route suggestions management
 */
router.use("/routeSuggestion", routeSuggestionRoutes);

/**
 * @swagger
 * tags:
 *  name: User
 *  description: User management
 */
router.use("/user", userRoutes);

/**
 * @swagger
 * tags:
 *  name: Ranking
 *  description: Rankings management
 */
router.use("/ranking", rankingRoutes);

/**
 * @swagger
 * tags:
 *  name: Notification
 *  description: Notifications management
 */
router.use("/notification", notificationRoute);

/**
 * @swagger
 * tags:
 *  name: Chat
 *  description: Chat messages management
 */
router.use("/message", chatMessageRoute);


/**
 * @swagger
 * tags:
 *  name: Password
 *  description: Password reset route
 */
router.use("/resetPassword", passwordReset);

/**
 * @swagger
 * tags:
<<<<<<< HEAD
=======
 *  name: Google
 *  description: Google auth route
 */
router.use('/authGoogle', googleAuthRoutes);

/**
 * @swagger
 * tags:
>>>>>>> develop
 *  name: Auth  
 *  description: Auth for general routes when loggin in
 */
router.get("/auth", authenticate, (req,res) =>{
    res.sendStatus(200);
});

/**
 * @swagger
 * /error:
 *  post:
 *   tags: [Error]
 *   description: Handles errors in the API
 *   responses:
 *    '400':
 *      description: Bad request error
 */
router.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.status || HTTP_STATUS.SERVER_ERROR;
    const message = typeof err.message === 'string' ? err.message : 'An unexpected error occurred';
    console.log(message)
    res.status(statusCode).send({ message, statusCode });
});

export default router;
