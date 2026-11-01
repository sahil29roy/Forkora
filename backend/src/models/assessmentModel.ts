import { pool, query } from '../config/db';
import {
  AssessmentModuleRow,
  AssessmentAttemptRow,
  AssessmentAssignedQuestionRow,
  AssessmentResponseRow,
  AssessmentResultRow,
  ClientSafeQuestion,
  ModuleProgressDTO,
} from '../types/assessmentTypes';
import { PreparedAssignedQuestion } from '../services/assessmentSelectionService';

/**
 * Retrieves all active assessment modules.
 */
export async function getAllAssessmentModules(): Promise<AssessmentModuleRow[]> {
  const res = await query<AssessmentModuleRow>(
    `SELECT * FROM assessment_modules WHERE is_active = true ORDER BY id ASC`
  );
  return res.rows;
}

/**
 * Retrieves a single assessment module by ID.
 */
export async function getAssessmentModuleById(moduleId: string): Promise<AssessmentModuleRow | null> {
  const res = await query<AssessmentModuleRow>(
    `SELECT * FROM assessment_modules WHERE LOWER(id) = LOWER($1) AND is_active = true`,
    [moduleId]
  );
  return res.rows[0] || null;
}

/**
 * Retrieves any in-progress attempt for a user and module.
 */
export async function getActiveAttempt(
  userId: number,
  moduleId: string
): Promise<AssessmentAttemptRow | null> {
  const res = await query<AssessmentAttemptRow>(
    `SELECT * FROM assessment_attempts 
     WHERE user_id = $1 AND LOWER(module_id) = LOWER($2) AND status = 'IN_PROGRESS' 
     ORDER BY id DESC LIMIT 1`,
    [userId, moduleId]
  );
  return res.rows[0] || null;
}

/**
 * Retrieves an attempt by its ID.
 */
export async function getAttemptById(attemptId: number): Promise<AssessmentAttemptRow | null> {
  const res = await query<AssessmentAttemptRow>(
    `SELECT * FROM assessment_attempts WHERE id = $1`,
    [attemptId]
  );
  return res.rows[0] || null;
}

/**
 * Transactionally creates an assessment attempt with assigned questions and randomized options.
 */
export async function createAssessmentAttempt(
  userId: number,
  moduleId: string,
  totalQuestions: number,
  assignedQuestions: PreparedAssignedQuestion[]
): Promise<AssessmentAttemptRow> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Determine the next attempt number for this user and module
    const attemptNumRes = await client.query<{ next_num: number }>(
      `SELECT COALESCE(MAX(attempt_number), 0) + 1 AS next_num 
       FROM assessment_attempts 
       WHERE user_id = $1 AND LOWER(module_id) = LOWER($2)`,
      [userId, moduleId]
    );
    const attemptNumber = attemptNumRes.rows[0].next_num || 1;

    // Create the attempt record
    const attemptInsertSql = `
      INSERT INTO assessment_attempts (
        user_id, module_id, status, attempt_number, total_questions, answered_count, started_at
      ) VALUES ($1, $2, 'IN_PROGRESS', $3, $4, 0, CURRENT_TIMESTAMP)
      RETURNING *;
    `;
    const attemptRes = await client.query<AssessmentAttemptRow>(attemptInsertSql, [
      userId,
      moduleId.toLowerCase(),
      attemptNumber,
      totalQuestions,
    ]);
    const attempt = attemptRes.rows[0];

    // Bulk insert the assigned questions with stable randomized options
    for (const q of assignedQuestions) {
      await client.query(
        `INSERT INTO assessment_assigned_questions (
           attempt_id, question_id, display_order, assigned_options, is_answered
         ) VALUES ($1, $2, $3, $4, false)`,
        [attempt.id, q.question_id, q.display_order, JSON.stringify(q.assigned_options)]
      );
    }

    await client.query('COMMIT');
    return attempt;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Retrieves client-safe assigned questions for an attempt in stable display order.
 * Strictly strips correct answers, answer keys, and scoring rubrics.
 */
export async function getSafeAssignedQuestionsForAttempt(
  attemptId: number
): Promise<ClientSafeQuestion[]> {
  const sql = `
    SELECT 
      aq.id AS assigned_question_id,
      aq.display_order,
      aq.assigned_options,
      aq.is_answered,
      q.question_text,
      q.subject,
      q.topic,
      r.selected_option_id,
      r.selected_option_text,
      r.response_value
    FROM assessment_assigned_questions aq
    JOIN assessment_questions q ON aq.question_id = q.id
    LEFT JOIN assessment_responses r ON r.attempt_id = aq.attempt_id AND r.assigned_question_id = aq.id
    WHERE aq.attempt_id = $1
    ORDER BY aq.display_order ASC;
  `;

  const res = await query<{
    assigned_question_id: number;
    display_order: number;
    assigned_options: any;
    is_answered: boolean;
    question_text: string;
    subject: string | null;
    topic: string | null;
    selected_option_id: number | null;
    selected_option_text: string | null;
    response_value: number | null;
  }>(sql, [attemptId]);

  return res.rows.map((row) => {
    let rawOptions = row.assigned_options;
    if (typeof rawOptions === 'string') {
      try {
        rawOptions = JSON.parse(rawOptions);
      } catch {
        rawOptions = [];
      }
    }
    if (!Array.isArray(rawOptions)) {
      rawOptions = [];
    }

    // Sanitize options to expose only option_id and option_text
    const safeOptions = rawOptions.map((opt: any) => ({
      option_id: opt.option_id,
      option_text: opt.option_text,
    }));

    return {
      assigned_question_id: row.assigned_question_id,
      display_order: row.display_order,
      question_text: row.question_text,
      subject: row.subject,
      topic: row.topic,
      options: safeOptions,
      is_answered: Boolean(row.is_answered || row.selected_option_text || row.response_value),
      selected_option_id: row.selected_option_id,
      selected_option_text: row.selected_option_text,
      response_value: row.response_value,
    };
  });
}

/**
 * Saves or updates a student's response to an assigned question.
 */
export async function saveStudentResponse(
  attemptId: number,
  assignedQuestionId: number,
  optionId?: number | null,
  optionText?: string | null,
  responseValue?: number | null
): Promise<{
  response: AssessmentResponseRow;
  answeredCount: number;
  totalQuestions: number;
  progressPercentage: number;
}> {
  // Validate that the assigned question exists and belongs to this attempt
  const assignedRes = await query<AssessmentAssignedQuestionRow>(
    `SELECT * FROM assessment_assigned_questions WHERE id = $1 AND attempt_id = $2`,
    [assignedQuestionId, attemptId]
  );

  if (assignedRes.rows.length === 0) {
    throw new Error('Assigned question not found or does not belong to the specified attempt.');
  }

  const assigned = assignedRes.rows[0];
  const questionId = assigned.question_id;

  // Resolve option text if only optionId was provided
  let resolvedOptionText = optionText || null;
  if (optionId && !resolvedOptionText) {
    let assignedOpts = assigned.assigned_options;
    if (typeof assignedOpts === 'string') {
      try {
        assignedOpts = JSON.parse(assignedOpts);
      } catch {
        assignedOpts = [];
      }
    }
    const matched = Array.isArray(assignedOpts)
      ? assignedOpts.find((o: any) => Number(o.option_id) === Number(optionId))
      : null;
    if (matched) {
      resolvedOptionText = matched.option_text;
    }
  }

  // Upsert the response record
  const upsertRes = await query<AssessmentResponseRow>(
    `INSERT INTO assessment_responses (
       attempt_id, assigned_question_id, question_id, selected_option_id, selected_option_text, response_value, updated_at
     ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
     ON CONFLICT (attempt_id, assigned_question_id)
     DO UPDATE SET
       selected_option_id = EXCLUDED.selected_option_id,
       selected_option_text = EXCLUDED.selected_option_text,
       response_value = EXCLUDED.response_value,
       updated_at = CURRENT_TIMESTAMP
     RETURNING *;`,
    [attemptId, assignedQuestionId, questionId, optionId || null, resolvedOptionText, responseValue || null]
  );

  // Mark assigned question as answered
  await query(
    `UPDATE assessment_assigned_questions SET is_answered = true WHERE id = $1`,
    [assignedQuestionId]
  );

  // Recalculate answered count on attempt
  const countRes = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM assessment_responses WHERE attempt_id = $1`,
    [attemptId]
  );
  const answeredCount = parseInt(countRes.rows[0].count, 10);

  const attemptUpdateRes = await query<AssessmentAttemptRow>(
    `UPDATE assessment_attempts 
     SET answered_count = $1, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $2 RETURNING total_questions`,
    [answeredCount, attemptId]
  );
  const totalQuestions = attemptUpdateRes.rows[0]?.total_questions || 10;
  const progressPercentage = Math.round((answeredCount / totalQuestions) * 100);

  return {
    response: upsertRes.rows[0],
    answeredCount,
    totalQuestions,
    progressPercentage,
  };
}

/**
 * Returns the current progress of an attempt.
 */
export async function getAttemptProgress(attemptId: number): Promise<{
  attemptId: number;
  moduleId: string;
  status: string;
  totalQuestions: number;
  answeredCount: number;
  progressPercentage: number;
  startedAt?: Date | string | null;
}> {
  const res = await query<AssessmentAttemptRow>(
    `SELECT id, module_id, status, total_questions, answered_count, started_at
     FROM assessment_attempts
     WHERE id = $1`,
    [attemptId]
  );

  if (res.rows.length === 0) {
    throw new Error(`Assessment attempt ${attemptId} not found.`);
  }

  const row = res.rows[0];
  const progressPercentage = row.total_questions > 0
    ? Math.round((row.answered_count / row.total_questions) * 100)
    : 0;

  return {
    attemptId: row.id,
    moduleId: row.module_id,
    status: row.status,
    totalQuestions: row.total_questions,
    answeredCount: row.answered_count,
    progressPercentage,
    startedAt: row.started_at,
  };
}

/**
 * Transactionally marks an attempt as COMPLETED and records final scoring results.
 */
export async function completeAttemptAndSaveResult(
  attemptId: number,
  userId: number,
  moduleId: string,
  totalQuestions: number,
  correctAnswers: number,
  scorePercentage: number,
  summary: any
): Promise<AssessmentResultRow> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Update attempt
    await client.query(
      `UPDATE assessment_attempts 
       SET status = 'COMPLETED',
           submitted_at = CURRENT_TIMESTAMP,
           score = $1,
           score_breakdown = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [scorePercentage, JSON.stringify(summary), attemptId]
    );

    // Upsert into assessment_results
    const resultRes = await client.query<AssessmentResultRow>(
      `INSERT INTO assessment_results (
         attempt_id, user_id, module_id, total_questions, correct_answers, score_percentage, summary, completed_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
       ON CONFLICT (attempt_id) DO UPDATE SET
         total_questions = EXCLUDED.total_questions,
         correct_answers = EXCLUDED.correct_answers,
         score_percentage = EXCLUDED.score_percentage,
         summary = EXCLUDED.summary,
         completed_at = CURRENT_TIMESTAMP
       RETURNING *;`,
      [attemptId, userId, moduleId.toLowerCase(), totalQuestions, correctAnswers, scorePercentage, JSON.stringify(summary)]
    );

    await client.query('COMMIT');
    return resultRes.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Retrieves the stored assessment result for an attempt.
 */
export async function getAssessmentResultByAttemptId(
  attemptId: number
): Promise<AssessmentResultRow | null> {
  const res = await query<AssessmentResultRow>(
    `SELECT * FROM assessment_results WHERE attempt_id = $1`,
    [attemptId]
  );
  return res.rows[0] || null;
}

/**
 * Retrieves consolidated assessment status across all modules for a given user.
 */
export async function getUserConsolidatedAssessmentStatus(
  userId: number
): Promise<ModuleProgressDTO[]> {
  const modulesRes = await query<AssessmentModuleRow>(
    `SELECT * FROM assessment_modules WHERE is_active = true ORDER BY id ASC`
  );

  const attemptsRes = await query<AssessmentAttemptRow>(
    `SELECT DISTINCT ON (module_id) *
     FROM assessment_attempts
     WHERE user_id = $1
     ORDER BY module_id, id DESC`,
    [userId]
  );

  const attemptsByModule: Record<string, AssessmentAttemptRow> = {};
  for (const att of attemptsRes.rows) {
    attemptsByModule[att.module_id.toLowerCase()] = att;
  }

  return modulesRes.rows.map((mod) => {
    const att = attemptsByModule[mod.id.toLowerCase()];

    if (!att) {
      return {
        module_id: mod.id,
        module_type: mod.module_type,
        title: mod.title,
        description: mod.description,
        instructions: mod.instructions,
        total_questions: mod.total_questions,
        estimated_duration_minutes: mod.estimated_duration_minutes,
        status: 'NOT_STARTED',
        attempt_id: null,
        answered_count: 0,
        progress_percentage: 0,
        score: null,
        completed_at: null,
      };
    }

    const progressPercentage = att.total_questions > 0
      ? Math.round((att.answered_count / att.total_questions) * 100)
      : 0;

    return {
      module_id: mod.id,
      module_type: mod.module_type,
      title: mod.title,
      description: mod.description,
      instructions: mod.instructions,
      total_questions: mod.total_questions,
      estimated_duration_minutes: mod.estimated_duration_minutes,
      status: att.status,
      attempt_id: att.id,
      answered_count: att.answered_count,
      progress_percentage: progressPercentage,
      score: att.score ? Number(att.score) : null,
      completed_at: att.submitted_at || null,
    };
  });
}
