import { Server, Socket } from 'socket.io';
import { notificationControllers } from '../controllers/notification.controller';

interface NotificationData {
    type: 'all' | 'specificRole' | 'specificUser';
    message: string;
    roleId?: string;
    userId?: string;
}

const notificationSocketHandler = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        //console.log(`Usuario conectado: ${socket.id}`);

        socket.on('registerUser', ({ userId, role }: { userId: string; role: string }) => {
            socket.data.userId = userId;
            socket.data.role = role;
            //console.log(`Usuario registrado: ${userId}, Rol: ${role}`);
        });

        socket.on('sendNotification', async (data: NotificationData) => {
            const { type, message, userId, roleId } = data;

            try {
                if (!message || !type) {
                    console.error('Datos de notificación inválidos:', data);
                    return;
                }

                if (type === 'all') {
                    io.emit('receiveNotification', { message });
                }
                else if (type === 'specificRole' && roleId) {
                    const sockets = [...io.sockets.sockets.values()];
                    sockets.forEach((s) => {
                        if (s.data.role === roleId) {
                            s.emit('receiveNotification', { message });
                        }
                    });
                }
                else if (type === 'specificUser' && userId) {
                    const targetSocket = [...io.sockets.sockets.values()].find(
                        (s) => s.data.userId === userId
                    );
                    if (targetSocket) {
                        targetSocket.emit('receiveNotification', { message });
                    }
                } else {
                    console.error('Tipo de notificación inválido:', type);
                }

                await notificationControllers.saveFromSocket({
                    notificationId: `${Date.now()}-${socket.id}`,
                    message,
                    userId,
                    type,
                    status: 'sent',
                    createdAt: new Date(),
                });
            } catch (error) {
                console.error('Error al manejar la notificación:', error);
            }
        });

        socket.on('disconnect', () => {
            //console.log(`Usuario desconectado: ${socket.id}`);
        });
    });
};

export default notificationSocketHandler;
