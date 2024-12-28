const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

/**
 * Authentication middleware to protect routes
 * Verifies the JWT token from the Authorization header
 */
const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError(401, 'No token provided');
        }

        const token = authHeader.split(' ')[1];
        
        if (!token) {
            throw new ApiError(401, 'No token provided');
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            throw new ApiError(401, 'Invalid token');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = auth;
