import { Schema, model, SchemaTypes } from 'mongoose';

const deliverySchema = new Schema({
    deliveryId: { type: SchemaTypes.String, required: true },
    assignedTo: { type: SchemaTypes.String, required: true },
    status: { type: SchemaTypes.String, required: true }, // in-progress, completed, stopped, canceled, Pending
    route: { type: SchemaTypes.String, required: true },
    productDetails: {
        productId: { type: SchemaTypes.String, required: true },
        name: { type: SchemaTypes.String, required: true },
        description: { type: SchemaTypes.String, required: true },
        quantity: { type: SchemaTypes.Number, required: true },
    },
    pickupLocation: { type: SchemaTypes.String, required: true },
    deliveryLocation: { type: SchemaTypes.String, required: true },
    scheduledTime: { type: SchemaTypes.Date, required: true },
    deliveredAt: { type: SchemaTypes.Date, required: false },
    createdAt: { type: SchemaTypes.Date, default: Date.now },
    updatedAt: { type: SchemaTypes.Date, default: Date.now },
});

const DeliveryModel = model('deliveries', deliverySchema);

export default DeliveryModel;
