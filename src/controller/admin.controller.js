import User from '../models/userModels.js';
import { Reel } from '../models/reelModel.js';
import { Article } from '../models/articleModels.js';
import { Chat } from '../models/chatModel.js';
import { Message } from '../models/messageModel.js';
import { FriendRequest } from '../models/friendRequestModel.js';
import { Notification } from '../models/notificationModel.js';

export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalReels = await Reel.countDocuments();
        const totalArticles = await Article.countDocuments();
        const totalChats = await Chat.countDocuments();
        res.json({ totalUsers, totalReels, totalArticles, totalChats });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ users });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await Reel.deleteMany({ user: id });
        await Article.deleteMany({ author: user.email });
        const chats = await Chat.find({ participants: id });
        const chatIds = chats.map(c => c._id);
        await Message.deleteMany({ chat: { $in: chatIds } });
        await Chat.deleteMany({ participants: id });
        await FriendRequest.deleteMany({ $or: [{ sender: id }, { receiver: id }] });
        await Notification.deleteMany({ user: id });
        await User.findByIdAndDelete(id);

        res.json({ message: 'User and all associated data deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

export const getAllReels = async (req, res) => {
    try {
        const reels = await Reel.find().populate('user', 'firstname lastname email').sort({ createdAt: -1 });
        res.json({ reels });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reels', error: error.message });
    }
};

export const deleteReel = async (req, res) => {
    try {
        const { id } = req.params;
        const reel = await Reel.findByIdAndDelete(id);
        if (!reel) return res.status(404).json({ message: 'Reel not found' });
        res.json({ message: 'Reel deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting reel', error: error.message });
    }
};

export const getAllArticles = async (req, res) => {
    try {
        const articles = await Article.find().sort({ createdAt: -1 });
        res.json({ articles });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching articles', error: error.message });
    }
};

export const deleteArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const article = await Article.findByIdAndDelete(id);
        if (!article) return res.status(404).json({ message: 'Article not found' });
        res.json({ message: 'Article deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting article', error: error.message });
    }
};
