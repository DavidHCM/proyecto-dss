import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs/promises';
import { HTTP_STATUS } from "../types/http-status-codes";
import xss from 'xss';
import rateLimit from 'express-rate-limit';

const emailRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip,
});

class PasswordController {
    sendResetPasswordEmail = async (req: Request, res: Response) => {
        emailRateLimiter(req, res, async (err) => {
            if (err) return;

            const { email, userId } = req.body;

            const resetToken = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '1h' });
            const resetLink = `https://ige.onrender.com/resetPassword/reset-password?token=${resetToken}`;

            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: Number(process.env.EMAIL_PORT),
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });

            try {
                const htmlPath = path.resolve(process.cwd(), 'src/public/views/emails/reset-password.html');
                const html = await fs.readFile(htmlPath, 'utf8');
                const customizedHtml = html.replace('{resetLink}', resetLink);

                const mailOptions = {
                    from: process.env.EMAIL_USER!,
                    to: email,
                    subject: 'Restablecer contraseña',
                    text: `Haz clic en este enlace para restablecer tu contraseña: ${resetLink}`,
                    html: customizedHtml,
                };

                await transporter.sendMail(mailOptions);
                res.status(HTTP_STATUS.SUCCESS).send(xss('Correo enviado con éxito'));
            } catch (error) {
                console.error('Error enviando el correo:', error);
                res.status(HTTP_STATUS.SERVER_ERROR).send(xss('Error enviando el correo'));
            }
        });
    };

    serveResetPasswordForm = async (req: Request, res: Response) => {
        emailRateLimiter(req, res, async (err) => {
            if (err) return;

            const { token } = req.query;
            try {
                if (!token) throw new Error('No token provided');

                const sanitizedToken = xss(token as string);
                jwt.verify(sanitizedToken, process.env.JWT_SECRET!);

                const filePath = path.resolve(process.cwd(), 'src/public/views/emails/reset-password-form.html');
                await fs.access(filePath);

                const htmlContent = (await fs.readFile(filePath, 'utf8')).replace('{token}', sanitizedToken);
                res.setHeader('Content-Type', 'text/html');
                res.send(xss(htmlContent));
            } catch (error) {
                console.error('Error al procesar el token:', error);
                res.status(HTTP_STATUS.BAD_REQUEST).send(xss('Token inválido o expirado'));
            }
        });
    };
}

export const passwordController = new PasswordController();
