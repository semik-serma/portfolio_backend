import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import {
    getDashboardStats,
    getAllUsers,
    deleteUser,
    getAllReels,
    deleteReel,
    getAllArticles,
    deleteArticle,
} from '../controller/admin.controller.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/reels', getAllReels);
router.delete('/reels/:id', deleteReel);
router.get('/articles', getAllArticles);
router.delete('/articles/:id', deleteArticle);

export default router;
