import { Schema, model, SchemaTypes } from 'mongoose';

const routeSuggestionSchema = new Schema({
    routeSuggestionId: { type: SchemaTypes.String, required: true },
    deliveryId: { type: SchemaTypes.String, required: true },
    suggestedRoute: { type: SchemaTypes.String, required: true },
    estimatedTime: { type: SchemaTypes.String, required: true },
    createdAt: { type: SchemaTypes.Date, default: Date.now },
});

const RouteSuggestionModel = model('routeSuggestions', routeSuggestionSchema);

export default RouteSuggestionModel;
