import mongoose from 'mongoose';

const mediaItemSchema = new mongoose.Schema({
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], required: true }
}, { _id: false });

const reelSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    media: [mediaItemSchema],
    caption: { type: String, default: '' },
    hashtags: [{ type: String }],
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    savesCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    privacy: { type: String, enum: ['public', 'private'], default: 'public' },
}, { timestamps: true });

export const Reel = mongoose.model('Reel', reelSchema);
