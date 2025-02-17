import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import {userControllers} from "./user.controller";
import {HTTP_STATUS} from "../types/http-status-codes";

class PasswordController {
    async sendResetPasswordEmail(req: Request, res: Response) {
        const { email, userId } = req.body;

        const resetToken = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '1h' });
        //TODO : CAMBIAR EN DEPLOY
        //const resetLink = `http://localhost:3000/resetPassword/reset-password?token=${resetToken}`;
        const resetLink = `https://ige.onrender.com/resetPassword/reset-password?token=${resetToken}`;

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });


        const htmlPath = path.resolve(process.cwd(), 'src/public/views/emails/reset-password.html');
        const html = fs.readFileSync(htmlPath, 'utf8');
        const customizedHtml = html.replace('{resetLink}', resetLink);


        const mailOptions = {
            from: process.env.EMAIL_USER!,
            to: email,
            subject: 'Restablecer contraseña',
            text: `Haz clic en este enlace para restablecer tu contraseña: ${resetLink}`,
            html: customizedHtml,
        };

        try {
            await transporter.sendMail(mailOptions);
            res.status(200).send('Correo enviado con éxito');
        } catch (error) {
            console.error('Error enviando el correo:', error);
            res.status(500).send('Error enviando el correo');
        }
    }

    async serveResetPasswordForm(req: Request, res: Response) {
        const { token } = req.query;

        try {
            if (!token) {
                throw ('No token provided' + HTTP_STATUS.BAD_REQUEST);
            }

            jwt.verify(token as string, process.env.JWT_SECRET!);

            const filePath = path.resolve(process.cwd(), 'src/public/views/emails/reset-password-form.html');

            // Verifica si el archivo existe
            if (!fs.existsSync(filePath)) {
                throw new Error(`El archivo no existe en la ruta especificada: ${filePath}`);
            }

            const htmlContent = fs.readFileSync(filePath, 'utf8').replace('{token}', token as string);


            res.setHeader('Content-Type', 'text/html');
            res.send(htmlContent);
        } catch (error) {
            console.error('Error al procesar el token:', error);
            res.status(400).send('Token inválido o expirado');
        }
    }
}


export const passwordController = new PasswordController();

