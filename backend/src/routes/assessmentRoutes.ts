import express from 'express';
import {
  listModules,
  getModuleDetails,
  startOrResumeAssessment,
  resumeAssessment,
  getAssignedQuestions,
  saveResponse,
  getProgress,
  submitAssessment,
  getResults,
  getConsolidatedStatus,
} from '../controllers/assessmentController';
import { authenticateToken, requireEmailVerified } from '../middleware/authMiddleware';

const router = express.Router();

// Apply auth middleware to all assessment routes
router.use(authenticateToken, requireEmailVerified);

// Module catalog & consolidated status
router.get('/modules', listModules);
router.get('/status', getConsolidatedStatus);
router.get('/overview', getConsolidatedStatus);
router.get('/modules/:moduleId', getModuleDetails);

// Start or resume assessment attempt
router.post('/modules/:moduleId/start', startOrResumeAssessment);
router.get('/attempts/:attemptId', resumeAssessment);
router.post('/attempts/:attemptId/resume', resumeAssessment);

// Questions delivery (safe client payload)
router.get('/attempts/:attemptId/questions', getAssignedQuestions);

// Response recording & progress tracking
router.post('/attempts/:attemptId/responses', saveResponse);
router.get('/attempts/:attemptId/progress', getProgress);

// Submission & scoring results
router.post('/attempts/:attemptId/submit', submitAssessment);
router.get('/attempts/:attemptId/results', getResults);

export default router;
