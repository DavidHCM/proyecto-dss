import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import {config} from 'dotenv'
import swaggerJSDoc from "swagger-jsdoc";
import { serve, setup } from 'swagger-ui-express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import swaggerConfig from '../swagger.config.json';
import notificationSocketHandler from './sockets/socket.handler';
import chatSocketHandler from './sockets/chatSocker.handler'
import session from "express-session";
import passport from "passport";
import helmet from 'helmet';
config();


import routesIndex from './routes/index';

const app = express();

app.use(helmet());
app.disable('x-powered-by');

app.use(cors());




app.use(
    session({
        secret: 'supersecretkey' , // Cambia esto en producción
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }, // Usa `true` si tu app está en HTTPS
    })
);

app.use(passport.initialize());
app.use(passport.session());


const port = process.env.PORT || 3000;

const dbURL = process.env.DB_URL;

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: 'https://ige-front.onrender.com', // TODO: Cambiar a la url en deploy
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
});

notificationSocketHandler(io);
chatSocketHandler(io);


mongoose.connect(dbURL as string).then(() => {
    console.log('Base de datos conectada');

    app.use(routesIndex);
    const swaggerDocs = swaggerJSDoc(swaggerConfig);
    app.use('/swagger', serve, setup(swaggerDocs));
    console.log('Swagger configurado');

    const server = app.listen(port, () => {
        console.log(`Servidor ejecutándose en el puerto ${port}`);
    });

    const io = new Server(server, {
        cors: {
            origin: 'https://ige-front.onrender.com', // Cambiar a la URL específica si es necesario
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
        },
    });

    notificationSocketHandler(io);
    chatSocketHandler(io);

}).catch((err) => {
    console.error('Error al conectar a la base de datos:', err);
});

export default app;


//TODO: Cambiar las rutas de las suggestionRoutes para que implementen la libreria y tambien en el guardado de ellas en mongoDB.
