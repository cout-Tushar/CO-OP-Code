import mongoose from 'mongoose';

const codeSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true },
    code: { type: String, default: '' }
});

export const Code= mongoose.model('Code', codeSchema);