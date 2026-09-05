const express = require('express');
const router = express.Router();
const {
  signup,
  verifyEmail,
  resendVerificationCode,
  signin,
  me,
  signout,
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public Auth Routes
router.post('/signup', signup);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationCode);
router.post('/signin', signin);

// Protected Auth Routes
router.get('/me', authenticateToken, me);
router.post('/signout', authenticateToken, signout);

module.exports = router;
