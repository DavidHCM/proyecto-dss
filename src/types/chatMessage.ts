export interface ChatMessage {
    messageId: string;
    fromUserId: string;
    toUserId: string;
    deliveryId: string;
    content: string;
    createdAt: Date;
}