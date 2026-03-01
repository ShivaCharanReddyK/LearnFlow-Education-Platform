const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid authentication token' });
    }
};

const counselorOnly = (req, res, next) => {
    if (req.user.role !== 'counselor') {
        return res.status(403).json({ error: 'Access denied. Counselor role required.' });
    }
    next();
};

const studentOnly = (req, res, next) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ error: 'Access denied. Student role required.' });
    }
    next();
};

module.exports = { auth, counselorOnly, studentOnly };
