import express from 'express';
import {
  getCareerRecommendations,
  getCareerPathways,
  getCareerNodes,
  updateCareerPreferences,
  getCareerPreferences,
  getStudentMLPredictions,
} from '../controllers/careerController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Career discovery & weighted recommendation calculations
router.get('/recommendations', authenticateToken, getCareerRecommendations);
router.get('/discovery', authenticateToken, getCareerRecommendations);

// Python ML Model Predictions
router.get('/ml-predictions', authenticateToken, getStudentMLPredictions);

// Graph pathways traversal
router.get('/pathways/:careerCode', authenticateToken, getCareerPathways);

// Graph catalog nodes
router.get('/nodes', getCareerNodes);

// Student career preferences
router.get('/preferences', authenticateToken, getCareerPreferences);
router.post('/preferences', authenticateToken, updateCareerPreferences);

export default router;
