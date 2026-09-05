const { verifyToken } = require('../utils/authUtils');
const { findUserById } = require('../models/userModel');

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      error: 'Access Denied',
      message: 'Authentication token is required. Please sign in.',
    });
  }

  try {
    const decoded = verifyToken(token);
    const user = await findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        error: 'Invalid Token',
        message: 'The user associated with this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token Expired',
        message: 'Your session has expired. Please sign in again.',
      });
    }

    return res.status(401).json({
      error: 'Invalid Token',
      message: 'Failed to authenticate token.',
    });
  }
}


function requireEmailVerified(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
  }

  if (!req.user.is_email_verified) {
    return res.status(403).json({
      error: 'Email Not Verified',
      message: 'Please verify your email address to access this feature.',
      is_email_verified: false,
    });
  }

  next();
}

module.exports = {
  authenticateToken,
  requireEmailVerified,
};
