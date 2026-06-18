import { Chat } from '../models/chatModel.js';
import { Message } from '../models/messageModel.js';
import { Notification } from '../models/notificationModel.js';

export const getConversations = async (req, res) => {
    try {
        const chats = await Chat.find({ participants: req.user._id })
            .populate('participants', 'firstname lastname email lastSeen')
            .populate('lastSender', 'firstname lastname email')
            .sort({ lastMessageAt: -1, updatedAt: -1 });
        res.json({ chats });
    } catch (error) {
        res.status(400).json({ message: 'Failed to get conversations', error: error.message });
    }
};

export const getOrCreateChat = async (req, res) => {
    try {
        const { userId } = req.params;
        let chat = await Chat.findOne({
            participants: { $all: [req.user._id, userId], $size: 2 }
        }).populate('participants', 'firstname lastname email');
        if (!chat) {
            chat = await Chat.create({ participants: [req.user._id, userId] });
            chat = await chat.populate('participants', 'firstname lastname email');
        }
        res.json({ chat });
    } catch (error) {
        res.status(400).json({ message: 'Failed to get chat', error: error.message });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: 'Chat not found' });
        if (!chat.participants.some(p => p.toString() === req.user._id.toString())) {
            return res.status(403).json({ message: 'Not a participant' });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = 50;
        const skip = (page - 1) * limit;
        const messages = await Message.find({ chat: chatId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('sender', 'firstname lastname email')
            .populate('reel', 'media caption');
        const total = await Message.countDocuments({ chat: chatId });
        await Message.updateMany(
            { chat: chatId, sender: { $ne: req.user._id }, readBy: { $ne: req.user._id } },
            { $push: { readBy: req.user._id } }
        );
        res.json({ messages: messages.reverse(), total, hasMore: skip + limit < total });
    } catch (error) {
        res.status(400).json({ message: 'Failed to get messages', error: error.message });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { chatId, content, reelId } = req.body;
        if (!chatId) return res.status(400).json({ message: 'Chat ID required' });
        if (!content && !reelId) return res.status(400).json({ message: 'Content or reel required' });
        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: 'Chat not found' });
        if (!chat.participants.some(p => p.toString() === req.user._id.toString())) {
            return res.status(403).json({ message: 'Not a participant' });
        }
        const message = await Message.create({
            chat: chatId,
            sender: req.user._id,
            content: content || '',
            reel: reelId || undefined,
            readBy: [req.user._id]
        });
        chat.lastMessage = content || (reelId ? 'Shared a reel' : '');
        chat.lastMessageAt = new Date();
        chat.lastSender = req.user._id;
        await chat.save();
        const populated = await message.populate('sender', 'firstname lastname email');
        if (reelId) await populated.populate('reel', 'media caption');
        const otherUserId = chat.participants.find(p => p.toString() !== req.user._id.toString());
        await Notification.create({
            user: otherUserId,
            type: 'new_message',
            fromUser: req.user._id,
            message: `${req.user.firstname || req.user.email}: ${(content || 'Shared a reel').substring(0, 80)}`,
            data: { chatId: chat._id, messageId: message._id }
        });
        res.status(201).json({ message: 'Message sent', msg: populated });
    } catch (error) {
        res.status(400).json({ message: 'Failed to send message', error: error.message });
    }
};

export const shareReel = async (req, res) => {
    try {
        const { friendId, reelId, chatId } = req.body;
        if (!friendId || !reelId) return res.status(400).json({ message: 'Friend and reel required' });
        let chat;
        if (chatId) {
            chat = await Chat.findById(chatId);
        } else {
            chat = await Chat.findOne({
                participants: { $all: [req.user._id, friendId], $size: 2 }
            });
        }
        if (!chat) {
            chat = await Chat.create({ participants: [req.user._id, friendId] });
        }
        if (!chat.participants.some(p => p.toString() === req.user._id.toString())) {
            return res.status(403).json({ message: 'Not a participant' });
        }
        const message = await Message.create({
            chat: chat._id,
            sender: req.user._id,
            content: '',
            reel: reelId,
            readBy: [req.user._id]
        });
        chat.lastMessage = 'Shared a reel';
        chat.lastMessageAt = new Date();
        chat.lastSender = req.user._id;
        await chat.save();
        const populated = await message.populate('sender', 'firstname lastname email');
        await populated.populate('reel', 'media caption');
        const otherUserId = chat.participants.find(p => p.toString() !== req.user._id.toString());
        await Notification.create({
            user: otherUserId,
            type: 'reel_shared',
            fromUser: req.user._id,
            message: `${req.user.firstname || req.user.email} shared a reel with you`,
            data: { chatId: chat._id, messageId: message._id, reelId }
        });
        res.status(201).json({ message: 'Reel shared', msg: populated, chatId: chat._id });
    } catch (error) {
        res.status(400).json({ message: 'Failed to share reel', error: error.message });
    }
};
