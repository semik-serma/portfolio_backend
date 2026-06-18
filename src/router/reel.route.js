import express from 'express';
import { uploadVideo } from '../utils/cloudinary.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import {
    uploadReel,
    getFeed,
    getReel,
    likeReel,
    saveReel,
    commentOnReel,
    getComments,
    getUserReels,
    getSavedReels,
    deleteReel
} from '../controller/reel.controller.js';

const reelRoute = express.Router();

reelRoute.post('/upload', authenticate, uploadVideo.array('media', 10), uploadReel);
reelRoute.get('/feed', optionalAuth, getFeed);
reelRoute.get('/saved', authenticate, getSavedReels);
reelRoute.get('/:id', optionalAuth, getReel);
reelRoute.post('/like/:id', authenticate, likeReel);
reelRoute.post('/save/:id', authenticate, saveReel);
reelRoute.post('/comment/:id', authenticate, commentOnReel);
reelRoute.get('/comments/:id', getComments);
reelRoute.get('/user/:userId', optionalAuth, getUserReels);
reelRoute.delete('/:id', authenticate, deleteReel);

export default reelRoute;
