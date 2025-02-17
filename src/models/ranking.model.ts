import { Schema, model, SchemaTypes } from 'mongoose';

const rankingSchema = new Schema({
    userId: { type: SchemaTypes.String, required: true },
    points: { type: SchemaTypes.Number, required: true },
    rank: { type: SchemaTypes.Number, required: true },
});

const RankingModel = model('rankings', rankingSchema);

export default RankingModel;
