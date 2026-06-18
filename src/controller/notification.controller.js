import { Notification } from '../models/notificationModel.js';

export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .populate('fromUser', 'firstname lastname email')
            .sort({ createdAt: -1 })
            .limit(50);
        const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });
        res.json({ notifications, unreadCount });
    } catch (error) {
        res.status(400).json({ message: 'Failed to get notifications', error: error.message });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        if (id === 'all') {
            await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
            return res.json({ message: 'All notifications marked as read' });
        }
        const notif = await Notification.findOne({ _id: id, user: req.user._id });
        if (!notif) return res.status(404).json({ message: 'Notification not found' });
        notif.read = true;
        await notif.save();
        res.json({ message: 'Marked as read' });
    } catch (error) {
        res.status(400).json({ message: 'Failed to mark as read', error: error.message });
    }
};

export const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({ user: req.user._id, read: false });
        res.json({ unreadCount: count });
    } catch (error) {
        res.status(400).json({ message: 'Failed to get count', error: error.message });
    }
};
