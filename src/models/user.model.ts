import { Schema, model, SchemaTypes } from 'mongoose';

const userSchema = new Schema({
    userId: { type: SchemaTypes.String, required: true },
    name: { type: SchemaTypes.String, required: true },
    email: { type: SchemaTypes.String, required: true },
    password: { type: SchemaTypes.String, required: true },
    role: { type: SchemaTypes.String, required: true }, // admin, support, driver, user
    status: { type: SchemaTypes.String, required: false }, // new, active, inactive, deleted, archived
    profilePic: { type: SchemaTypes.String, required: false },
    createdAt: { type: SchemaTypes.Date, default: Date.now },
    googleToken: {type: SchemaTypes.String}
});

const UserModel = model('users', userSchema);

export default UserModel;