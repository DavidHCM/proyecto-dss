import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import {config} from "dotenv";
import {chatMessageControllers} from "../controllers";
config();

const chatSocketHandler = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        //console.log(`Usuario conectado: ${socket.id}`);

        socket.on('registerUserChat', ({ token }: { token: string }) => {
            try {
                const secretKey = process.env.JWT_SECRET || 'asd';
                const decoded = jwt.verify(token, secretKey) as { userId: string; name: string };

                socket.data.userId = decoded.userId;
                socket.data.username = decoded.name;
                //console.log(socket.data);

                //console.log(`Usuario registrado: ${decoded.name} (${decoded.userId})`);
            } catch (error) {
                console.error('Error al verificar el token:', error);
            }
        });

        socket.on('joinRoom', ({ roomName }) => {
            const previousRoom = socket.data.roomName;
            const username = socket.data.username || 'Desconocido';

            if (previousRoom && previousRoom !== roomName) {
                socket.to(previousRoom).emit('userLeft', { message: `${username} ha salido de la sala`, username });
                socket.leave(previousRoom);
            }

            socket.join(roomName);
            socket.data.roomName = roomName;

            //console.log(`${username} se unió a la sala ${roomName}`);
            socket.to(roomName).emit('userJoined', { message: `${username} se ha unido a la sala`, username });
        });


        socket.on('sendMessage', async ({ roomName, message }) => {
            const username = socket.data.username || 'Desconocido';

            try {
                await chatMessageControllers.saveMessage({
                    fromUserId: socket.data.userId,
                    toUserId: roomName,
                    deliveryId: roomName,
                    content: message,
                });

                socket.broadcast.to(roomName).emit('receiveMessage', {
                    username,
                    message,
                    roomName,
                });
            } catch (err) {
                console.error('Error while handling sendMessage:', err);
            }
        });


        socket.on('disconnect', () => {
            const roomName = socket.data.roomName;
            const username = socket.data.username;

            if (roomName && username) {
                socket.to(roomName).emit('userLeft', { message: `${username} ha salido de la sala` });
                //console.log(`${username} ha salido de la sala ${roomName}`);
            }
        });
    });
};

export default chatSocketHandler;
