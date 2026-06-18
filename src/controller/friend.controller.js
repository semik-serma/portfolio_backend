import { FriendRequest } from '../models/friendRequestModel.js';
import { Chat } from '../models/chatModel.js';
import { Notification } from '../models/notificationModel.js';
import User from '../models/userModels.js';

export const searchUsers = async (req, res) => {
    try {
        const query = req.query.q || '';
        if (!query.trim()) return res.json({ users: [] });
        const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        const users = await User.find({
            $or: [{ firstname: regex }, { lastname: regex }, { email: regex }],
            _id: { $ne: req.user._id }
        }).select('firstname lastname email lastSeen');
        res.json({ users });
    } catch (error) {
        res.status(400).json({ message: 'Search failed', error: error.message });
    }
};

export const sendRequest = async (req, res) => {
    try {
        const { receiverId } = req.body;
        if (!receiverId) return res.status(400).json({ message: 'Receiver ID required' });
        if (receiverId === req.user._id.toString()) return res.status(400).json({ message: 'Cannot send request to yourself' });
        const existing = await FriendRequest.findOne({
            $or: [
                { sender: req.user._id, receiver: receiverId },
                { sender: receiverId, receiver: req.user._id }
            ]
        });
        if (existing) {
            if (existing.status === 'accepted') return res.status(400).json({ message: 'Already friends' });
            if (existing.status === 'pending') return res.status(400).json({ message: 'Request already sent' });
            existing.status = 'pending';
            await existing.save();
            await Notification.create({
                user: receiverId,
                type: 'friend_request',
                fromUser: req.user._id,
                message: `${req.user.firstname || req.user.email} sent you a friend request`
            });
            return res.json({ message: 'Friend request sent', request: existing });
        }
        const request = await FriendRequest.create({ sender: req.user._id, receiver: receiverId });
        await Notification.create({
            user: receiverId,
            type: 'friend_request',
            fromUser: req.user._id,
            message: `${req.user.firstname || req.user.email} sent you a friend request`
        });
        res.status(201).json({ message: 'Friend request sent', request });
    } catch (error) {
        res.status(400).json({ message: 'Failed to send request', error: error.message });
    }
};

export const acceptRequest = async (req, res) => {
    try {
        const request = await FriendRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: 'Request not found' });
        if (request.receiver.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
        if (request.status !== 'pending') return res.status(400).json({ message: 'Request is not pending' });
        request.status = 'accepted';
        await request.save();
        let chat = await Chat.findOne({
            participants: { $all: [request.sender, request.receiver], $size: 2 }
        });
        if (!chat) chat = await Chat.create({ participants: [request.sender, request.receiver] });
        await Notification.create({
            user: request.sender,
            type: 'friend_accepted',
            fromUser: req.user._id,
            message: `${req.user.firstname || req.user.email} accepted your friend request`,
            data: { chatId: chat._id }
        });
        res.json({ message: 'Friend request accepted', chatId: chat._id });
    } catch (error) {
        res.status(400).json({ message: 'Failed to accept', error: error.message });
    }
};

export const rejectRequest = async (req, res) => {
    try {
        const request = await FriendRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: 'Request not found' });
        if (request.receiver.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
        request.status = 'rejected';
        await request.save();
        res.json({ message: 'Friend request rejected' });
    } catch (error) {
        res.status(400).json({ message: 'Failed to reject', error: error.message });
    }
};

export const getPendingRequests = async (req, res) => {
    try {
        const requests = await FriendRequest.find({ receiver: req.user._id, status: 'pending' })
            .populate('sender', 'firstname lastname email')
            .sort({ createdAt: -1 });
        res.json({ requests });
    } catch (error) {
        res.status(400).json({ message: 'Failed to get requests', error: error.message });
    }
};

export const getSentRequests = async (req, res) => {
    try {
        const requests = await FriendRequest.find({ sender: req.user._id, status: 'pending' })
            .populate('receiver', 'firstname lastname email')
            .sort({ createdAt: -1 });
        res.json({ requests });
    } catch (error) {
        res.status(400).json({ message: 'Failed to get sent requests', error: error.message });
    }
};

export const getFriends = async (req, res) => {
    try {
        const accepted = await FriendRequest.find({
            $or: [{ sender: req.user._id }, { receiver: req.user._id }],
            status: 'accepted'
        }).populate('sender receiver', 'firstname lastname email lastSeen');
        const friends = accepted.map(r => {
            const friend = r.sender._id.toString() === req.user._id.toString() ? r.receiver : r.sender;
            return { ...friend.toObject(), friendshipId: r._id };
        });
        res.json({ friends });
    } catch (error) {
        res.status(400).json({ message: 'Failed to get friends', error: error.message });
    }
};

export const unfriend = async (req, res) => {
    try {
        const request = await FriendRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: 'Friendship not found' });
        const userId = req.user._id.toString();
        if (request.sender.toString() !== userId && request.receiver.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        await Chat.findOneAndDelete({ participants: { $all: [request.sender, request.receiver], $size: 2 } });
        await FriendRequest.findByIdAndDelete(req.params.id);
        res.json({ message: 'Unfriended' });
    } catch (error) {
        res.status(400).json({ message: 'Failed to unfriend', error: error.message });
    }
};
