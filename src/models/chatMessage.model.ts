import { Schema, model, SchemaTypes } from 'mongoose';

const chatMessageSchema = new Schema({
    messageId: { type: SchemaTypes.String, required: true },
    fromUserId: { type: SchemaTypes.String, required: true },
    toUserId: { type: SchemaTypes.String, required: true },
    deliveryId: { type: SchemaTypes.String, required: true },
    content: { type: SchemaTypes.String, required: true },
    createdAt: { type: SchemaTypes.Date, default: Date.now },
});

const ChatMessageModel = model('chatMessages', chatMessageSchema);

export default ChatMessageModel;
