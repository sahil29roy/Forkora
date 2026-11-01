import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import {
  moduleIdParamSchema,
  attemptIdParamSchema,
  saveResponseSchema,
} from '../validators/assessmentValidator';
import {
  getAllAssessmentModules,
  getAssessmentModuleById,
  getActiveAttempt,
  getAttemptById,
  createAssessmentAttempt,
  getSafeAssignedQuestionsForAttempt,
  saveStudentResponse,
  getAttemptProgress,
  completeAttemptAndSaveResult,
  getAssessmentResultByAttemptId,
  getUserConsolidatedAssessmentStatus,
} from '../models/assessmentModel';
import { selectAndPrepareQuestions } from '../services/assessmentSelectionService';
import { calculateAttemptScore } from '../services/assessmentScoringService';

/**
 * Lists all available assessment modules and the user's progress on each.
 */
export async function listModules(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawUserId = req.user?.id;
    const userId = Number(rawUserId);
    if (!rawUserId || isNaN(userId)) {
      res.status(401).json({ status: 'error', message: 'Authentication required.' });
      return;
    }

    const modules = await getUserConsolidatedAssessmentStatus(userId);
    res.status(200).json({
      status: 'success',
      data: modules,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieves details and instructions for a single assessment module.
 */
export async function getModuleDetails(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const paramsParsed = moduleIdParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid module ID.',
        errors: paramsParsed.error.flatten(),
      });
      return;
    }

    const { moduleId } = paramsParsed.data;
    const moduleRow = await getAssessmentModuleById(moduleId);
    if (!moduleRow) {
      res.status(404).json({
        status: 'error',
        message: `Assessment module '${moduleId}' not found.`,
      });
      return;
    }

    const rawUserId = req.user?.id;
    const userId = Number(rawUserId);
    let activeAttempt = null;
    if (rawUserId && !isNaN(userId)) {
      activeAttempt = await getActiveAttempt(userId, moduleId);
    }

    res.status(200).json({
      status: 'success',
      data: {
        ...moduleRow,
        active_attempt: activeAttempt,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Starts a new assessment attempt or resumes an existing incomplete attempt.
 */
export async function startOrResumeAssessment(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawUserId = req.user?.id;
    const userId = Number(rawUserId);
    if (!rawUserId || isNaN(userId)) {
      res.status(401).json({ status: 'error', message: 'Authentication required.' });
      return;
    }

    const paramsParsed = moduleIdParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid module ID.',
        errors: paramsParsed.error.flatten(),
      });
      return;
    }

    const { moduleId } = paramsParsed.data;
    const moduleRow = await getAssessmentModuleById(moduleId);
    if (!moduleRow) {
      res.status(404).json({
        status: 'error',
        message: `Assessment module '${moduleId}' not found.`,
      });
      return;
    }

    // Check if user already has an active, in-progress attempt
    const existingAttempt = await getActiveAttempt(userId, moduleId);
    if (existingAttempt) {
      res.status(200).json({
        status: 'success',
        resumed: true,
        message: 'Resumed existing incomplete attempt.',
        data: existingAttempt,
      });
      return;
    }

    // Select questions and prepare randomized options server-side
    const assignedQuestions = await selectAndPrepareQuestions(moduleId, userId);

    // Create the attempt with assigned questions transactionally
    const newAttempt = await createAssessmentAttempt(
      userId,
      moduleId,
      assignedQuestions.length,
      assignedQuestions
    );

    res.status(201).json({
      status: 'success',
      resumed: false,
      message: 'Started new assessment attempt.',
      data: newAttempt,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Resumes an assessment by attempt ID.
 */
export async function resumeAssessment(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawUserId = req.user?.id;
    const userId = Number(rawUserId);
    if (!rawUserId || isNaN(userId)) {
      res.status(401).json({ status: 'error', message: 'Authentication required.' });
      return;
    }

    const paramsParsed = attemptIdParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid attempt ID.',
        errors: paramsParsed.error.flatten(),
      });
      return;
    }

    const { attemptId } = paramsParsed.data;
    const attempt = await getAttemptById(attemptId);

    if (!attempt) {
      res.status(404).json({ status: 'error', message: 'Assessment attempt not found.' });
      return;
    }

    if (Number(attempt.user_id) !== userId) {
      res.status(403).json({
        status: 'error',
        message: 'Access denied. You do not own this assessment attempt.',
      });
      return;
    }

    const progress = await getAttemptProgress(attemptId);

    res.status(200).json({
      status: 'success',
      data: {
        attempt,
        progress,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Fetches the questions assigned to this attempt in stable randomised order.
 * Client-facing payload contains ONLY safe presentation properties.
 */
export async function getAssignedQuestions(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawUserId = req.user?.id;
    const userId = Number(rawUserId);
    if (!rawUserId || isNaN(userId)) {
      res.status(401).json({ status: 'error', message: 'Authentication required.' });
      return;
    }

    const paramsParsed = attemptIdParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid attempt ID.',
        errors: paramsParsed.error.flatten(),
      });
      return;
    }

    const { attemptId } = paramsParsed.data;
    const attempt = await getAttemptById(attemptId);

    if (!attempt) {
      res.status(404).json({ status: 'error', message: 'Assessment attempt not found.' });
      return;
    }

    if (Number(attempt.user_id) !== userId) {
      res.status(403).json({
        status: 'error',
        message: 'Access denied. You do not own this assessment attempt.',
      });
      return;
    }

    const questions = await getSafeAssignedQuestionsForAttempt(attemptId);

    res.status(200).json({
      status: 'success',
      data: {
        attempt_id: attempt.id,
        module_id: attempt.module_id,
        status: attempt.status,
        total_questions: attempt.total_questions,
        answered_count: attempt.answered_count,
        questions,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Saves a student's answer to an assigned question.
 */
export async function saveResponse(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawUserId = req.user?.id;
    const userId = Number(rawUserId);
    if (!rawUserId || isNaN(userId)) {
      res.status(401).json({ status: 'error', message: 'Authentication required.' });
      return;
    }

    const paramsParsed = attemptIdParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid attempt ID.',
        errors: paramsParsed.error.flatten(),
      });
      return;
    }

    const bodyParsed = saveResponseSchema.safeParse(req.body);
    if (!bodyParsed.success) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid response payload.',
        errors: bodyParsed.error.flatten(),
      });
      return;
    }

    const { attemptId } = paramsParsed.data;
    const attempt = await getAttemptById(attemptId);

    if (!attempt) {
      res.status(404).json({ status: 'error', message: 'Assessment attempt not found.' });
      return;
    }

    if (Number(attempt.user_id) !== userId) {
      res.status(403).json({
        status: 'error',
        message: 'Access denied. You do not own this assessment attempt.',
      });
      return;
    }

    if (attempt.status === 'COMPLETED') {
      res.status(400).json({
        status: 'error',
        message: 'Cannot modify a completed assessment attempt.',
      });
      return;
    }

    const { assigned_question_id, selected_option_id, selected_option_text, response_value } = bodyParsed.data;

    const result = await saveStudentResponse(
      attemptId,
      assigned_question_id,
      selected_option_id,
      selected_option_text,
      response_value
    );

    res.status(200).json({
      status: 'success',
      message: 'Response saved successfully.',
      data: {
        assigned_question_id,
        answered_count: result.answeredCount,
        total_questions: result.totalQuestions,
        progress_percentage: result.progressPercentage,
      },
    });
  } catch (error: any) {
    if (error.message && error.message.includes('Assigned question not found')) {
      res.status(400).json({ status: 'error', message: error.message });
      return;
    }
    next(error);
  }
}

/**
 * Fetches the progress of an assessment attempt.
 */
export async function getProgress(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawUserId = req.user?.id;
    const userId = Number(rawUserId);
    if (!rawUserId || isNaN(userId)) {
      res.status(401).json({ status: 'error', message: 'Authentication required.' });
      return;
    }

    const paramsParsed = attemptIdParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid attempt ID.',
        errors: paramsParsed.error.flatten(),
      });
      return;
    }

    const { attemptId } = paramsParsed.data;
    const attempt = await getAttemptById(attemptId);

    if (!attempt) {
      res.status(404).json({ status: 'error', message: 'Assessment attempt not found.' });
      return;
    }

    if (Number(attempt.user_id) !== userId) {
      res.status(403).json({
        status: 'error',
        message: 'Access denied. You do not own this assessment attempt.',
      });
      return;
    }

    const progress = await getAttemptProgress(attemptId);
    res.status(200).json({
      status: 'success',
      data: progress,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Submits an assessment attempt, calculates scoring on backend, and stores result.
 */
export async function submitAssessment(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawUserId = req.user?.id;
    const userId = Number(rawUserId);
    if (!rawUserId || isNaN(userId)) {
      res.status(401).json({ status: 'error', message: 'Authentication required.' });
      return;
    }

    const paramsParsed = attemptIdParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid attempt ID.',
        errors: paramsParsed.error.flatten(),
      });
      return;
    }

    const { attemptId } = paramsParsed.data;
    const attempt = await getAttemptById(attemptId);

    if (!attempt) {
      res.status(404).json({ status: 'error', message: 'Assessment attempt not found.' });
      return;
    }

    if (Number(attempt.user_id) !== userId) {
      res.status(403).json({
        status: 'error',
        message: 'Access denied. You do not own this assessment attempt.',
      });
      return;
    }

    // Prevent duplicate submissions: return existing result gracefully
    if (attempt.status === 'COMPLETED') {
      const existingResult = await getAssessmentResultByAttemptId(attemptId);
      res.status(200).json({
        status: 'success',
        alreadySubmitted: true,
        message: 'Assessment attempt was already submitted.',
        data: existingResult,
      });
      return;
    }

    // Calculate score exclusively on the backend
    const scoreResult = await calculateAttemptScore(attemptId);

    // Save result and mark attempt COMPLETED
    const savedResult = await completeAttemptAndSaveResult(
      attemptId,
      userId,
      attempt.module_id,
      scoreResult.totalQuestions,
      scoreResult.correctAnswers,
      scoreResult.scorePercentage,
      scoreResult.summary
    );

    res.status(200).json({
      status: 'success',
      message: 'Assessment submitted successfully.',
      data: savedResult,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Fetches completed assessment results for an attempt.
 */
export async function getResults(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawUserId = req.user?.id;
    const userId = Number(rawUserId);
    if (!rawUserId || isNaN(userId)) {
      res.status(401).json({ status: 'error', message: 'Authentication required.' });
      return;
    }

    const paramsParsed = attemptIdParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid attempt ID.',
        errors: paramsParsed.error.flatten(),
      });
      return;
    }

    const { attemptId } = paramsParsed.data;
    const attempt = await getAttemptById(attemptId);

    if (!attempt) {
      res.status(404).json({ status: 'error', message: 'Assessment attempt not found.' });
      return;
    }

    if (Number(attempt.user_id) !== userId) {
      res.status(403).json({
        status: 'error',
        message: 'Access denied. You do not own this assessment attempt.',
      });
      return;
    }

    if (attempt.status !== 'COMPLETED') {
      res.status(400).json({
        status: 'error',
        message: 'Assessment is not completed yet.',
      });
      return;
    }

    const result = await getAssessmentResultByAttemptId(attemptId);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Fetches consolidated assessment status across all modules.
 */
export async function getConsolidatedStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawUserId = req.user?.id;
    const userId = Number(rawUserId);
    if (!rawUserId || isNaN(userId)) {
      res.status(401).json({ status: 'error', message: 'Authentication required.' });
      return;
    }

    const statusList = await getUserConsolidatedAssessmentStatus(userId);

    res.status(200).json({
      status: 'success',
      data: statusList,
    });
  } catch (error) {
    next(error);
  }
}
