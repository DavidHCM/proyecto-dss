export interface Notification {
    notificationId: string;
    userId: string;
    message: string;
    type: string;
    status: string;
    createdAt: Date;
}