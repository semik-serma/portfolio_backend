import { Reel } from '../models/reelModel.js';
import { ReelComment } from '../models/reelCommentModel.js';
import { ReelLike } from '../models/reelLikeModel.js';
import { ReelSave } from '../models/reelSaveModel.js';

export const uploadReel = async (req, res) => {
    try {
        const { caption, hashtags, privacy } = req.body;
        const files = req.files || [];
        if (!files.length) {
            return res.status(400).json({ message: 'At least one file is required' });
        }
        const media = files.map(f => ({
            url: f.path,
            type: f.mimetype?.startsWith('video/') ? 'video' : 'image'
        }));
        const reel = await Reel.create({
            user: req.user._id,
            media,
            caption: caption || '',
            hashtags: hashtags ? hashtags.split(',').map(t => t.trim()) : [],
            privacy: privacy || 'public',
        });
        res.status(201).json({ message: 'Reel uploaded successfully', reel });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(400).json({ message: 'error at upload reel', error: error.message });
    }
};

export const getFeed = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const reels = await Reel.find({ privacy: 'public' })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'firstname lastname email');

        if (!reels.length) {
            return res.json({ reels: [], page, totalPages: 0, hasMore: false });
        }

        const reelIds = reels.map(r => r._id);
        const [userLikes, userSaves] = await Promise.all([
            req.user
                ? ReelLike.find({ reel: { $in: reelIds }, user: req.user._id }).select('reel')
                : [],
            req.user
                ? ReelSave.find({ reel: { $in: reelIds }, user: req.user._id }).select('reel')
                : []
        ]);

        const likedSet = new Set(userLikes.map(l => l.reel.toString()));
        const savedSet = new Set(userSaves.map(s => s.reel.toString()));

        const reelsWithMeta = reels.map(reel => ({
            ...reel.toObject(),
            likedByMe: likedSet.has(reel._id.toString()),
            savedByMe: savedSet.has(reel._id.toString())
        }));

        const total = await Reel.countDocuments({ privacy: 'public' });

        res.json({
            reels: reelsWithMeta,
            page,
            totalPages: Math.ceil(total / limit),
            hasMore: skip + reels.length < total
        });
    } catch (error) {
        res.status(400).json({ message: 'error at reel feed', error: error.message });
    }
};

export const getReel = async (req, res) => {
    try {
        const reel = await Reel.findByIdAndUpdate(
            req.params.id,
            { $inc: { viewsCount: 1 } },
            { new: true }
        ).populate('user', 'firstname lastname email');

        if (!reel) return res.status(404).json({ message: 'Reel not found' });

        let likedByMe = false, savedByMe = false;
        if (req.user) {
            const [like, save] = await Promise.all([
                ReelLike.findOne({ reel: reel._id, user: req.user._id }),
                ReelSave.findOne({ reel: reel._id, user: req.user._id })
            ]);
            likedByMe = !!like;
            savedByMe = !!save;
        }

        res.json({ reel: { ...reel.toObject(), likedByMe, savedByMe } });
    } catch (error) {
        res.status(400).json({ message: 'error at get reel', error: error.message });
    }
};

export const likeReel = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await ReelLike.findOne({ reel: id, user: req.user._id });
        if (existing) {
            await ReelLike.findByIdAndDelete(existing._id);
            await Reel.findByIdAndUpdate(id, { $inc: { likesCount: -1 } });
            return res.json({ message: 'Unliked', liked: false });
        }
        await ReelLike.create({ reel: id, user: req.user._id });
        await Reel.findByIdAndUpdate(id, { $inc: { likesCount: 1 } });
        res.json({ message: 'Liked', liked: true });
    } catch (error) {
        res.status(400).json({ message: 'error at like reel', error: error.message });
    }
};

export const saveReel = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await ReelSave.findOne({ reel: id, user: req.user._id });
        if (existing) {
            await ReelSave.findByIdAndDelete(existing._id);
            await Reel.findByIdAndUpdate(id, { $inc: { savesCount: -1 } });
            return res.json({ message: 'Unsaved', saved: false });
        }
        await ReelSave.create({ reel: id, user: req.user._id });
        await Reel.findByIdAndUpdate(id, { $inc: { savesCount: 1 } });
        res.json({ message: 'Saved', saved: true });
    } catch (error) {
        res.status(400).json({ message: 'error at save reel', error: error.message });
    }
};

export const commentOnReel = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;
        if (!comment?.trim()) {
            return res.status(400).json({ message: 'Comment text is required' });
        }
        const newComment = await ReelComment.create({
            reel: id,
            user: req.user._id,
            comment: comment.trim()
        });
        await Reel.findByIdAndUpdate(id, { $inc: { commentsCount: 1 } });
        const populated = await newComment.populate('user', 'firstname lastname email');
        res.status(201).json({ message: 'Comment added', comment: populated });
    } catch (error) {
        res.status(400).json({ message: 'error at comment', error: error.message });
    }
};

export const getComments = async (req, res) => {
    try {
        const comments = await ReelComment.find({ reel: req.params.id })
            .sort({ createdAt: -1 })
            .populate('user', 'firstname lastname email');
        res.json({ comments });
    } catch (error) {
        res.status(400).json({ message: 'error at get comments', error: error.message });
    }
};

export const getUserReels = async (req, res) => {
    try {
        const reels = await Reel.find({ user: req.params.userId })
            .sort({ createdAt: -1 })
            .populate('user', 'firstname lastname email');
        const enriched = await Promise.all(reels.map(async (reel) => {
            let savedByMe = false, likedByMe = false;
            if (req.user) {
                const [like, save] = await Promise.all([
                    ReelLike.findOne({ reel: reel._id, user: req.user._id }),
                    ReelSave.findOne({ reel: reel._id, user: req.user._id })
                ]);
                likedByMe = !!like;
                savedByMe = !!save;
            }
            return { ...reel.toObject(), likedByMe, savedByMe };
        }));
        res.json({ reels: enriched });
    } catch (error) {
        res.status(400).json({ message: 'error at user reels', error: error.message });
    }
};

export const deleteReel = async (req, res) => {
    try {
        const reel = await Reel.findOne({ _id: req.params.id, user: req.user._id });
        if (!reel) return res.status(404).json({ message: 'Reel not found or unauthorized' });
        await Promise.all([
            ReelComment.deleteMany({ reel: reel._id }),
            ReelLike.deleteMany({ reel: reel._id }),
            ReelSave.deleteMany({ reel: reel._id }),
            Reel.findByIdAndDelete(reel._id)
        ]);
        res.json({ message: 'Reel deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'error at delete reel', error: error.message });
    }
};

export const getSavedReels = async (req, res) => {
    try {
        const saves = await ReelSave.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate({
                path: 'reel',
                populate: { path: 'user', select: 'firstname lastname email' }
            });
        const reels = saves.map(s => ({
            ...s.reel.toObject(),
            savedByMe: true,
            likedByMe: false
        }));
        res.json({ reels });
    } catch (error) {
        res.status(400).json({ message: 'error at saved reels', error: error.message });
    }
};
