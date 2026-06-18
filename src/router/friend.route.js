import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
    searchUsers, sendRequest, acceptRequest, rejectRequest,
    getPendingRequests, getSentRequests, getFriends, unfriend
} from '../controller/friend.controller.js';

const friendRoute = express.Router();

friendRoute.get('/search', authenticate, searchUsers);
friendRoute.post('/request', authenticate, sendRequest);
friendRoute.post('/accept/:id', authenticate, acceptRequest);
friendRoute.post('/reject/:id', authenticate, rejectRequest);
friendRoute.get('/pending', authenticate, getPendingRequests);
friendRoute.get('/sent', authenticate, getSentRequests);
friendRoute.get('/list', authenticate, getFriends);
friendRoute.delete('/unfriend/:id', authenticate, unfriend);

export default friendRoute;
