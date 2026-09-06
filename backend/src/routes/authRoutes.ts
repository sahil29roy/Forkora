import express from 'express';
import {
  signup,
  verifyEmail,
  resendVerificationCode,
  signin,
  me,
  signout,
} from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Public Auth Routes
router.post('/signup', signup);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationCode);
router.post('/signin', signin);

// Protected Auth Routes
router.get('/me', authenticateToken as any, me as any);
router.post('/signout', authenticateToken as any, signout as any);

export default router;
