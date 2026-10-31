import express from 'express';
import {
  submitOnboarding,
  getOnboarding,
  updateParents,
  getAcademicCatalog,
} from '../controllers/onboardingController';
import { authenticateToken, requireEmailVerified } from '../middleware/authMiddleware';

const router = express.Router();

// Public helper endpoint for UI dynamic subject discovery and stream lists
router.get('/catalog', getAcademicCatalog);

// Protected onboarding routes
router.post('/', authenticateToken, requireEmailVerified, submitOnboarding);
router.get('/', authenticateToken, requireEmailVerified, getOnboarding);
router.put('/parents', authenticateToken, requireEmailVerified, updateParents);

export default router;
