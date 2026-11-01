import express from 'express';
import {
  submitOnboarding,
  getOnboarding,
  updateParents,
  getAcademicCatalog,
  savePersonalStage1,
} from '../controllers/onboardingController';
import { authenticateToken, requireEmailVerified } from '../middleware/authMiddleware';

const router = express.Router();

// Public helper endpoint for UI dynamic subject discovery and stream lists
router.get('/catalog', getAcademicCatalog);

// Protected onboarding routes
router.post('/personal', authenticateToken, requireEmailVerified, savePersonalStage1);
router.post('/stage-1', authenticateToken, requireEmailVerified, savePersonalStage1);
router.post('/', authenticateToken, requireEmailVerified, (req, res, next) => {
  // If subjects or academic info is not yet provided, gracefully route to Stage 1 personal details save!
  if (!req.body.subjects && !req.body.academicDetails && !req.body.academic_details) {
    return savePersonalStage1(req, res, next);
  }
  return submitOnboarding(req, res, next);
});
router.get('/', authenticateToken, requireEmailVerified, getOnboarding);
router.put('/parents', authenticateToken, requireEmailVerified, updateParents);

export default router;

