import express, { Request, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { User } from '../types/user';
import { HTTP_STATUS } from '../types/http-status-codes';
import xss from 'xss';

const router = express.Router();

// Redirigir a Google para autenticación
router.get('/google', (req, res, next) => {
    next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));

// Manejar el callback después de autenticación en Google
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req: Request, res: Response) => {
        try {
            const user = req.user as User;

            if (!user || !user.userId || !user.email || !user.role || !user.name) {
                throw new Error('Authentication failed');
            }

            const token = jwt.sign(
                {
                    userId: user.userId,
                    email: user.email,
                    role: user.role,
                    name: user.name,
                },
                process.env.JWT_SECRET!,
            );

            const sanitizedToken = xss(token);

            res.redirect(`https://ige-front.onrender.com/login?token=${sanitizedToken}`);
        } catch (err) {
            console.error('Error during Google Authentication:', err);

            const status = err instanceof Error && 'status' in err ? (err as any).status : HTTP_STATUS.NOT_FOUND;
            const message = err instanceof Error && 'message' in err ? err.message : 'Error during Google Authentication';

            res.status(status).send({
                message: xss(message),
                error: xss(err.toString()),
            });
        }
    }
);

export default router;