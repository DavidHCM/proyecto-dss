import { Server } from 'socket.io';
import Notification from '../models/notification.model';

interface NotificationData {
    target: 'all' | 'role' | 'user';
    message: string;
    role?: string;
    userId?: string;
}

export const sendNotification = async (io: Server, data: NotificationData) => {
    try {
        const { target, message, role, userId } = data;

        if (target === 'all') {
            io.emit('receiveNotification', { message });
        } else if (target === 'role' && role) {
            const sockets = [...io.sockets.sockets.values()];
            sockets.forEach((s) => {
                if (s.data.role === role) {
                    s.emit('receiveNotification', { message });
                }
            });
        } else if (target === 'user' && userId) {
            const targetSocket = [...io.sockets.sockets.values()].find((s) => s.data.userId === userId);
            if (targetSocket) {
                targetSocket.emit('receiveNotification', { message });
            }
        }

        const notification = new Notification(data);
        await notification.save();
    } catch (error) {
        console.error('Error al enviar notificación:', error);
    }
};
