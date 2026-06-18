import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModels.js';

const heartbeatRoute = express.Router();

heartbeatRoute.post('/', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ message: 'No token' });
        const decoded = jwt.verify(token, 'key');
        await User.updateOne({ email: decoded.email }, { lastSeen: new Date() });
        res.json({ ok: true });
    } catch {
        res.status(401).json({ message: 'Invalid' });
    }
});

export default heartbeatRoute;
