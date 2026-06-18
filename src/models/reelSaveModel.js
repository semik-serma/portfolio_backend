import mongoose from 'mongoose';

const reelSaveSchema = new mongoose.Schema({
    reel: { type: mongoose.Schema.Types.ObjectId, ref: 'Reel', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

reelSaveSchema.index({ reel: 1, user: 1 }, { unique: true });

export const ReelSave = mongoose.model('ReelSave', reelSaveSchema);
