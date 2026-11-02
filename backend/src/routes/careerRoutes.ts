import express from 'express';
import {
  getCareerRecommendations,
  getCareerPathways,
  getCareerNodes,
  updateCareerPreferences,
  getCareerPreferences,
} from '../controllers/careerController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Career discovery & weighted recommendation calculations
router.get('/recommendations', authenticateToken, getCareerRecommendations);
router.get('/discovery', authenticateToken, getCareerRecommendations);

// Graph pathways traversal
router.get('/pathways/:careerCode', authenticateToken, getCareerPathways);

// Graph catalog nodes
router.get('/nodes', getCareerNodes);

// Student career preferences
router.get('/preferences', authenticateToken, getCareerPreferences);
router.post('/preferences', authenticateToken, updateCareerPreferences);

export default router;
