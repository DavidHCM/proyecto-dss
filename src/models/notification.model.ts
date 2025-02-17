import { Schema, model, SchemaTypes } from 'mongoose';

const notificationSchema = new Schema({
    target: { type: String, required: true, default: 'all' },
    message: { type: String, required: true },
    userId: { type: String },
    role: { type: String },
    status: { type: String, default: 'sent' },
    createdAt: { type: Date, default: Date.now },
});

const NotificationModel = model('notifications', notificationSchema);

export default NotificationModel;
