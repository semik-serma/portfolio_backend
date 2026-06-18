import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getNotifications, markAsRead, getUnreadCount } from '../controller/notification.controller.js';

const notificationRoute = express.Router();

notificationRoute.get('/', authenticate, getNotifications);
notificationRoute.post('/read/:id', authenticate, markAsRead);
notificationRoute.get('/unread-count', authenticate, getUnreadCount);

export default notificationRoute;
