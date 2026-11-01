import { query } from '../config/db';
import {
  AssessmentAttemptRow,
  AssessmentQuestionRow,
  AssessmentResponseRow,
  AssessmentQuestionOptionRow,
} from '../types/assessmentTypes';

export interface ModuleScoringResult {
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  summary: Record<string, any>;
}

/**
 * Calculates scores, subject/topic accuracy, and dimension aggregations for an attempt.
 */
export async function calculateAttemptScore(attemptId: number): Promise<ModuleScoringResult> {
  // Fetch attempt details
  const attemptRes = await query<AssessmentAttemptRow>(
    `SELECT * FROM assessment_attempts WHERE id = $1`,
    [attemptId]
  );
  if (attemptRes.rows.length === 0) {
    throw new Error(`Assessment attempt ${attemptId} not found.`);
  }
  const attempt = attemptRes.rows[0];
  const moduleId = attempt.module_id.toLowerCase();

  // Fetch all responses joined with original questions and options
  const responsesRes = await query<{
    response_id: number;
    question_id: number;
    selected_option_id: number | null;
    selected_option_text: string | null;
    response_value: number | null;
    question_text: string;
    subject: string | null;
    topic: string | null;
    correct_answer: string | null;
    scoring_rubric: any;
    score_metadata: any;
    score_value: number | null;
  }>(
    `SELECT 
       r.id AS response_id,
       r.question_id,
       r.selected_option_id,
       r.selected_option_text,
       r.response_value,
       q.question_text,
       q.subject,
       q.topic,
       q.correct_answer,
       q.scoring_rubric,
       opt.score_metadata,
       opt.score_value
     FROM assessment_responses r
     JOIN assessment_questions q ON r.question_id = q.id
     LEFT JOIN assessment_question_options opt ON r.selected_option_id = opt.id
     WHERE r.attempt_id = $1`,
    [attemptId]
  );

  const responses = responsesRes.rows;
  const totalQuestions = attempt.total_questions;

  switch (moduleId) {
    case 'academic': {
      let correctCount = 0;
      const subjectBreakdown: Record<string, { total: number; correct: number; percentage: number }> = {};
      const topicBreakdown: Record<string, { total: number; correct: number; percentage: number }> = {};

      for (const resp of responses) {
        const sub = resp.subject || 'General';
        const top = resp.topic || 'General';

        if (!subjectBreakdown[sub]) subjectBreakdown[sub] = { total: 0, correct: 0, percentage: 0 };
        if (!topicBreakdown[top]) topicBreakdown[top] = { total: 0, correct: 0, percentage: 0 };

        subjectBreakdown[sub].total++;
        topicBreakdown[top].total++;

        const isCorrect = Boolean(
          resp.correct_answer &&
          resp.selected_option_text &&
          resp.selected_option_text.trim().toLowerCase() === resp.correct_answer.trim().toLowerCase()
        );

        if (isCorrect) {
          correctCount++;
          subjectBreakdown[sub].correct++;
          topicBreakdown[top].correct++;
        }

        // Update response record in DB with correctness
        await query(
          `UPDATE assessment_responses 
           SET is_correct = $1, score_awarded = $2 
           WHERE id = $3`,
          [isCorrect, isCorrect ? 1 : 0, resp.response_id]
        );
      }

      // Calculate percentages
      for (const key of Object.keys(subjectBreakdown)) {
        const item = subjectBreakdown[key];
        item.percentage = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
      }
      for (const key of Object.keys(topicBreakdown)) {
        const item = topicBreakdown[key];
        item.percentage = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
      }

      const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

      return {
        totalQuestions,
        correctAnswers: correctCount,
        scorePercentage,
        summary: {
          answeredQuestions: responses.length,
          correctAnswers: correctCount,
          totalQuestions,
          scorePercentage,
          subjectPerformance: subjectBreakdown,
          topicPerformance: topicBreakdown,
        },
      };
    }

    case 'aptitude': {
      let correctCount = 0;
      const topicBreakdown: Record<string, { total: number; correct: number; percentage: number }> = {};

      for (const resp of responses) {
        const top = resp.topic || 'General Reasoning';

        if (!topicBreakdown[top]) topicBreakdown[top] = { total: 0, correct: 0, percentage: 0 };
        topicBreakdown[top].total++;

        const isCorrect = Boolean(
          resp.correct_answer &&
          resp.selected_option_text &&
          resp.selected_option_text.trim().toLowerCase() === resp.correct_answer.trim().toLowerCase()
        );

        if (isCorrect) {
          correctCount++;
          topicBreakdown[top].correct++;
        }

        // Update response record in DB
        await query(
          `UPDATE assessment_responses 
           SET is_correct = $1, score_awarded = $2 
           WHERE id = $3`,
          [isCorrect, isCorrect ? 1 : 0, resp.response_id]
        );
      }

      for (const key of Object.keys(topicBreakdown)) {
        const item = topicBreakdown[key];
        item.percentage = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
      }

      const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

      return {
        totalQuestions,
        correctAnswers: correctCount,
        scorePercentage,
        summary: {
          answeredQuestions: responses.length,
          correctAnswers: correctCount,
          totalQuestions,
          scorePercentage,
          topicPerformance: topicBreakdown,
        },
      };
    }

    case 'behavioural': {
      // 6 dimensions: average score from 1.0 to 5.0
      const dimensionScores: Record<string, { totalScore: number; count: number; average: number }> = {};
      const individualResponses: { question_id: number; dimension: string; score: number }[] = [];

      let totalScoreSum = 0;

      for (const resp of responses) {
        const dimension = resp.topic || (resp.scoring_rubric && resp.scoring_rubric.dimension) || 'General';
        const val = resp.response_value || (resp.score_value ? Number(resp.score_value) : 3);

        if (!dimensionScores[dimension]) {
          dimensionScores[dimension] = { totalScore: 0, count: 0, average: 0 };
        }

        dimensionScores[dimension].totalScore += val;
        dimensionScores[dimension].count++;
        totalScoreSum += val;

        individualResponses.push({
          question_id: resp.question_id,
          dimension,
          score: val,
        });

        await query(
          `UPDATE assessment_responses 
           SET response_value = $1, score_awarded = $2 
           WHERE id = $3`,
          [val, val, resp.response_id]
        );
      }

      // Calculate average per dimension
      for (const dim of Object.keys(dimensionScores)) {
        const item = dimensionScores[dim];
        item.average = item.count > 0 ? Math.round((item.totalScore / item.count) * 10) / 10 : 0;
      }

      const maxPossibleScore = totalQuestions * 5;
      const scorePercentage = maxPossibleScore > 0 ? Math.round((totalScoreSum / maxPossibleScore) * 100) : 0;

      return {
        totalQuestions,
        correctAnswers: responses.length,
        scorePercentage,
        summary: {
          answeredQuestions: responses.length,
          totalQuestions,
          dimensionAverages: Object.fromEntries(
            Object.entries(dimensionScores).map(([k, v]) => [k, v.average])
          ),
          dimensionDetails: dimensionScores,
          individualResponses,
        },
      };
    }

    case 'situational': {
      // Aggregate scenario rubric dimensions
      const signals: Record<string, { total: number; count: number; score: number }> = {};
      let totalSignalPoints = 0;
      let totalMaxSignalPoints = 0;

      for (const resp of responses) {
        const optionScores: Record<string, number> = resp.score_metadata || {};

        for (const [dim, val] of Object.entries(optionScores)) {
          if (!signals[dim]) {
            signals[dim] = { total: 0, count: 0, score: 0 };
          }
          signals[dim].total += val;
          signals[dim].count++;
          totalSignalPoints += val;
          totalMaxSignalPoints += 5; // each dimension max weight is 5
        }

        await query(
          `UPDATE assessment_responses 
           SET score_awarded = $1 
           WHERE id = $2`,
          [Object.values(optionScores).reduce((a, b) => a + b, 0) / (Object.keys(optionScores).length || 1), resp.response_id]
        );
      }

      for (const dim of Object.keys(signals)) {
        const item = signals[dim];
        item.score = item.count > 0 ? Math.round((item.total / item.count) * 10) / 10 : 0;
      }

      const scorePercentage = totalMaxSignalPoints > 0 ? Math.round((totalSignalPoints / totalMaxSignalPoints) * 100) : 0;

      return {
        totalQuestions,
        correctAnswers: responses.length,
        scorePercentage,
        summary: {
          answeredQuestions: responses.length,
          totalQuestions,
          scorePercentage,
          behaviouralSignals: Object.fromEntries(
            Object.entries(signals).map(([k, v]) => [k, v.score])
          ),
          signalDetails: signals,
        },
      };
    }

    default:
      throw new Error(`Unknown module type for scoring: ${moduleId}`);
  }
}
