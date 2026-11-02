import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { query } from '../config/db';
import { calculateCareerScores, loadStudentContext } from '../services/careerScoringService';
import { findPathwaysForCareer, getStartNodeCode } from '../services/careerPathwayService';
import { evaluateEligibility } from '../services/eligibilityService';
import { CareerRecommendationDTO } from '../types/careerTypes';

/**
 * Controller: Calculates and returns ranked career recommendations with compatibility scores,
 * deterministic eligibility status, human-readable reasons, and verified pathways.
 * 
 * Route: GET /api/careers/recommendations
 */
export async function getCareerRecommendations(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Authentication required.' });
      return;
    }

    // 1. Load Student Assessment and Academic Context
    const context = await loadStudentContext(userId);
    const startNodeCode = getStartNodeCode(context.currentClass, context.stream);

    // 2. Calculate Weighted Multi-Component Compatibility Scores
    const rankedCareerScores = await calculateCareerScores(userId);

    // 3. For each ranked career, determine verified pathways and evaluate deterministic eligibility
    const recommendations: CareerRecommendationDTO[] = [];

    for (const scoreResult of rankedCareerScores) {
      // Find connected pathways from student's current stage to target career
      const pathways = await findPathwaysForCareer(startNodeCode, scoreResult.careerNodeId);

      // Evaluate eligibility against graph prerequisites and rules
      const eligibilityEval = await evaluateEligibility(
        scoreResult.careerNodeId,
        scoreResult.careerCode,
        context
      );

      // Harmonize reasons: combine scoring insights with eligibility insights
      const combinedReasons = Array.from(
        new Set([...scoreResult.reasons, ...eligibilityEval.reasons])
      ).slice(0, 3);

      recommendations.push({
        career: scoreResult.career,
        career_code: scoreResult.careerCode,
        node_id: scoreResult.careerNodeId,
        compatibilityScore: scoreResult.compatibilityScore,
        eligibility: eligibilityEval.status,
        reasons: combinedReasons,
        pathways,
        breakdown: scoreResult.breakdown,
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        total_recommendations: recommendations.length,
        student_level: context.currentClass <= 10 ? 'Class 10' : 'Class 12',
        recommendations,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Returns verified pathways for a specific career from the student's current academic node.
 * 
 * Route: GET /api/careers/pathways/:careerCode
 */
export async function getCareerPathways(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    const careerCode = req.params.careerCode?.toUpperCase();

    if (!careerCode) {
      res.status(400).json({ status: 'error', message: 'Career code parameter is required.' });
      return;
    }

    const careerNodeRes = await query(
      `SELECT * FROM career_nodes WHERE UPPER(code) = $1 OR UPPER(title) = $1 LIMIT 1`,
      [careerCode]
    );

    if (careerNodeRes.rows.length === 0) {
      res.status(404).json({ status: 'error', message: `Career node not found for "${careerCode}".` });
      return;
    }

    const careerNode = careerNodeRes.rows[0];
    const context = userId ? await loadStudentContext(userId) : { currentClass: 10, stream: null };
    const startCode = getStartNodeCode(context.currentClass, context.stream);

    const pathways = await findPathwaysForCareer(startCode, careerNode.id);

    res.status(200).json({
      status: 'success',
      data: {
        career: careerNode.title,
        career_code: careerNode.code,
        start_stage: startCode,
        pathways,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Lists career graph catalog nodes (Careers, Courses, Entrance Exams, Streams)
 * 
 * Route: GET /api/careers/nodes
 */
export async function getCareerNodes(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { type, level, stream } = req.query;

    let sql = `SELECT * FROM career_nodes WHERE is_published = true`;
    const params: any[] = [];

    if (type) {
      params.push(String(type).toUpperCase());
      sql += ` AND node_type = $${params.length}`;
    }
    if (level) {
      params.push(String(level).toUpperCase());
      sql += ` AND education_level = $${params.length}`;
    }
    if (stream) {
      params.push(String(stream).toUpperCase());
      sql += ` AND stream = $${params.length}`;
    }

    sql += ` ORDER BY title ASC`;

    const result = await query(sql, params);

    res.status(200).json({
      status: 'success',
      data: {
        total: result.rows.length,
        nodes: result.rows,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Updates student's 3 preferred careers and work preferences
 * 
 * Route: POST /api/careers/preferences
 */
export async function updateCareerPreferences(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Authentication required.' });
      return;
    }

    const {
      preferred_careers,
      preferredCareers,
      interests,
      work_environment,
      workEnvironment,
      career_type,
      careerType,
      preferred_location,
      preferredLocation,
    } = req.body;

    const careersList = preferred_careers ?? preferredCareers ?? [];
    const interestsList = interests ?? [];
    const workEnv = work_environment ?? workEnvironment ?? 'No preference';
    const cType = career_type ?? careerType ?? 'No preference';
    const prefLoc = preferred_location ?? preferredLocation ?? 'No preference';

    await query(
      `UPDATE student_profiles
       SET preferred_careers = $1,
           interests = CASE WHEN $2::text[] <> '{}' THEN $2 ELSE interests END,
           work_environment = $3,
           career_type = $4,
           preferred_location = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $6`,
      [careersList, interestsList, workEnv, cType, prefLoc, userId]
    );

    res.status(200).json({
      status: 'success',
      message: 'Career preferences updated successfully.',
      data: {
        preferred_careers: careersList,
        interests: interestsList,
        work_environment: workEnv,
        career_type: cType,
        preferred_location: prefLoc,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Retrieves student's saved career preferences and interests
 * 
 * Route: GET /api/careers/preferences
 */
export async function getCareerPreferences(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Authentication required.' });
      return;
    }

    const resDb = await query(
      `SELECT preferred_careers, interests, work_environment, career_type, preferred_location
       FROM student_profiles
       WHERE user_id = $1
       ORDER BY id DESC LIMIT 1`,
      [userId]
    );

    const data = resDb.rows[0] || {
      preferred_careers: [],
      interests: [],
      work_environment: 'No preference',
      career_type: 'No preference',
      preferred_location: 'No preference',
    };

    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
}
