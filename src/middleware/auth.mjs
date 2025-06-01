import { User } from '../models/user.mjs';

export const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({ message: 'Unauthorized' });
};

export const requireAuth = (req, res, next) => {
    if (!req.session.user && !req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
};