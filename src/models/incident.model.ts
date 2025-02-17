import { Schema, model, SchemaTypes } from 'mongoose';

const incidentSchema = new Schema({
    incidentId: { type: SchemaTypes.String, required: true },
    reportedBy: { type: SchemaTypes.String, required: true },
    deliveryId: { type: SchemaTypes.String, required: true },
    type: { type: SchemaTypes.String, required: true }, // Ej: damage, delay, theft
    description: { type: SchemaTypes.String, required: true },
    status: { type: SchemaTypes.String, required: true }, // Ej: open, in-progress, resolved, closed
    createdAt: { type: SchemaTypes.Date, default: Date.now },
    resolvedAt: { type: SchemaTypes.Date, required: false },
    location: { type: SchemaTypes.String, required: true },
});

const IncidentModel = model('incidents', incidentSchema);

export default IncidentModel;
