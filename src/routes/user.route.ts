import { Router } from 'express';
import {passwordController, userControllers} from '../controllers/index';
import { uploadS3 } from '../service/file-upload.service';
import passport from 'passport';
import { authenticate, authorize, validateRequest } from "../middlewares";
import { validateRegisterUser, validateUserIdParam, validateLogin, validateUploadProfilePic } from '../validators/user.validator';

const router = Router();

/**
 * @swagger
 * components:
 *  schemas:
 *   User:
 *    type: object
 *    required:
 *     - name
 *     - email
 *     - password
 *    properties:
 *     name:
 *      type: string
 *      description: The user's name
 *     email:
 *      type: string
 *      format: email
 *      description: The user's email address
 *     createdAt:
 *      type: string
 *      format: date-time
 *      description: The time the user was created
 */


/**
 * @swagger
 * /user:
 *  get:
 *   description: Get all users
 *   tags: [User]
 *   security:
 *    - bearerAuth: []
 *   responses:
 *    200:
 *     description: A list of users
 *     content:
 *      application/json:
 *       schema:
 *        type: array
 *        items:
 *         $ref: '#/components/schemas/User'
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 */
router.get('', authenticate, authorize(['admin']), userControllers.getAll);

/**
 * @swagger
 * /user/drivers:
 *  get:
 *   description: Get a the users that are drivers
 *   tags: [User]
 *   security:
 *    - bearerAuth: []
 *   parameters:
 *    - name: userId
 *      in: path
 *      required: true
 *      schema:
 *       type: string
 *      description: The users that are drivers
 *   responses:
 *    200:
 *     description: User details
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/User'
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 *    404:
 *     description: User not found
 */
router.get('/drivers',authenticate, authorize(['admin', 'driver', 'support']), userControllers.getDrivers);

/**
 * @swagger
 * /user/{userId}:
 *  get:
 *   description: Get a specific user by ID
 *   tags: [User]
 *   security:
 *    - bearerAuth: []
 *   parameters:
 *    - name: userId
 *      in: path
 *      required: true
 *      schema:
 *       type: string
 *      description: The ID of the user
 *   responses:
 *    200:
 *     description: User details
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/User'
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 *    404:
 *     description: User not found
 */
router.get('/:userId', authenticate, authorize(['admin', 'driver', 'support']),  validateUserIdParam, validateRequest, userControllers.getById);

/**
 * @swagger
 * /user/{userId}:
 *  put:
 *   description: Update a user by ID
 *   tags: [User]
 *   security:
 *    - bearerAuth: []
 *   parameters:
 *    - name: userId
 *      in: path
 *      required: true
 *      schema:
 *       type: string
 *      description: The ID of the user
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/components/schemas/User'
 *   responses:
 *    200:
 *     description: User updated successfully
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 *    404:
 *     description: User not found
 */
router.put('/:userId', authenticate, authorize(['admin', 'driver']), userControllers.update);

/**
 * @swagger
 * /user/{userId}:
 *  delete:
 *   description: Delete a user by ID
 *   tags: [User]
 *   security:
 *    - bearerAuth: []
 *   parameters:
 *    - name: userId
 *      in: path
 *      required: true
 *      schema:
 *       type: string
 *      description: The ID of the user
 *   responses:
 *    200:
 *     description: User deleted successfully
 *    401:
 *     description: Unauthorized
 *    403:
 *     description: Forbidden
 *    404:
 *     description: User not found
 */
router.delete('/:userId', authenticate, authorize(['admin']), userControllers.delete);

/**
 * @swagger
 * /user/register:
 *  post:
 *   description: Register a new user
 *   tags: [User]
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/components/schemas/User'
 *   responses:
 *    201:
 *     description: User registered successfully
 *    400:
 *     description: Bad request (missing parameter or invalid data)
 */
router.post('/register',validateRegisterUser, validateRequest, userControllers.register);

/**
 * @swagger
 * /user/login:
 *  post:
 *   description: User login
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
 *     description: Authentication token
 *     content:
 *      application/json:
 *       schema:
 *        properties:
 *         token:
 *          type: string
 *    400:
 *     description: Bad request (missing parameter or invalid credentials)
 */
router.post('/login',validateLogin, validateRequest, userControllers.login);

    
/**
 * @swagger
 * /user/google:
 *  get:
 *   description: Redirects the user to the Google authentication page.
 *   tags: [User]
 *   responses:
 *    302:
 *     description: Redirect to Google's OAuth 2.0 endpoint.
 *    500:
 *     description: Internal server error.
 * 
 * /user/callback:
 *  get:
 *   description: Callback URL for Google authentication.
 *   tags: [User]
 *   parameters:
 *    - in: query
 *      name: code
 *      required: false
 *      schema:
 *       type: string
 *      description: The authorization code returned from Google.
 *    - in: query
 *      name: error
 *      required: false
 *      schema:
 *       type: string
 *      description: Error returned from Google if authentication fails.
 *   responses:
 *    302:
 *     description: Redirect to the home page after successful authentication.
 *    401:
 *     description: Authentication failed or invalid credentials.
 *    500:
 *     description: Internal server error.
 */
router.get('/google', passport.authenticate('google', { 
    scope: ['profile', 'email'] 
}));

router.get('/callback',
    passport.authenticate('google', { 
        failureRedirect: '/login' 
    }),
    (req, res) => {
      res.redirect('/'); // Enviar a home
    }
);

/**
 * @swagger
 * /user/send-reset-password-email:
 *  post:
 *   description: Reset password email
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
 *     description: Route to send to the user the reset-password-email
 *     content:
 *      application/json:
 *       schema:
 *        properties:
 *         token:
 *          type: string
 *    400:
 *     description: Bad request (missing parameter or invalid credentials)
 */
router.post('/send-reset-password-email', passwordController.sendResetPasswordEmail);

/**
 * @swagger
 * /user/reset-password:
 *  post:
 *   description: Updating the password
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
 *     description: Route to update the password
 *     content:
 *      application/json:
 *       schema:
 *        properties:
 *         token:
 *          type: string
 *    400:
 *     description: Bad request (missing parameter or invalid credentials)
 */
router.post('/reset-password', userControllers.updatePassword);

/**
 * @swagger
 * /user/upload:
 *  post:
 *   description: User profile pic upload
 *   tags: [User]
 *   requestBody:
 *    required: true
 *    content:
 *     multipart/form-data:
 *      schema:
 *       type: object
 *       properties:
 *        file:
 *         type: string
 *         format: binary
 *   responses:
 *    200:
 *     description: File uploaded successfully
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        properties:
 *         message:
 *          type: string
 *         fileKey:
 *          type: string
 *    400:
 *     description: Bad request (missing file or invalid format)
 *    500:
 *     description: Internal server error
 */
router.post('/upload', authenticate, authorize(['admin', 'driver', 'support']), uploadS3.single('file'),  validateUploadProfilePic, validateRequest, userControllers.uploadUserProfilePic);

/**
 * @swagger
 * /user/file/{key}:
 *  get:
 *   description: Retrieve user profile pic
 *   tags: [User]
 *   parameters:
 *    - name: key
 *      in: path
 *      required: true
 *      description: The S3 key of the file to retrieve
 *      schema:
 *       type: string
 *   responses:
 *    200:
 *     description: File retrieved successfully
 *     content:
 *      application/octet-stream:
 *        schema:
 *          type: string
 *          format: binary
 *    404:
 *     description: File not found
 */
router.get('/file/:key',  userControllers.getUserProfilePic);

export default router;
