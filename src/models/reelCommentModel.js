import mongoose from 'mongoose';

const reelCommentSchema = new mongoose.Schema({
    reel: { type: mongoose.Schema.Types.ObjectId, ref: 'Reel', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    comment: { type: String, required: true }
}, { timestamps: true });

export const ReelComment = mongoose.model('ReelComment', reelCommentSchema);
