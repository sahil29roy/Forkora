import crypto from 'crypto';
import { query } from '../config/db';
import { getOnboardingProfileByUserId } from '../models/onboardingModel';
import { AssessmentQuestionRow, AssessmentQuestionOptionRow, AssignedOptionDTO } from '../types/assessmentTypes';

/**
 * Robust server-side Fisher-Yates shuffle using crypto.randomInt
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export interface PreparedAssignedQuestion {
  question_id: number;
  display_order: number;
  assigned_options: AssignedOptionDTO[];
}

/**
 * Selects and randomises questions for an assessment attempt based on module requirements
 * and student academic background.
 */
export async function selectAndPrepareQuestions(
  moduleId: string,
  userId: number | string
): Promise<PreparedAssignedQuestion[]> {
  const userProfile = await getOnboardingProfileByUserId(userId);
  const currentClass = userProfile?.studentProfile?.current_class || 10;
  const enrolledStream = userProfile?.academicRecord?.stream?.toUpperCase() || null;
  const enrolledSubjects = (userProfile?.academicRecord?.subjects || []).map(s => s.subject_name.trim().toLowerCase());

  let selectedQuestions: AssessmentQuestionRow[] = [];

  switch (moduleId.toLowerCase()) {
    case 'academic': {
      // 10 questions
      const targetClassLevel = currentClass >= 11 ? 12 : 10;

      // Query available questions for the student's class level
      let questionsRes = await query<AssessmentQuestionRow>(
        `SELECT * FROM assessment_questions 
         WHERE module_id = 'academic' AND class_level = $1
         ORDER BY id ASC`,
        [targetClassLevel]
      );

      let pool = questionsRes.rows;

      // Filter by student's subjects/stream if applicable
      if (pool.length > 0 && enrolledSubjects.length > 0) {
        const matchingQuestions = pool.filter(q => {
          const qSub = (q.subject || '').trim().toLowerCase();
          return enrolledSubjects.some(sub => sub.includes(qSub) || qSub.includes(sub));
        });

        // Use matching questions if we have at least 10, otherwise supplement from same class level pool
        if (matchingQuestions.length >= 10) {
          pool = matchingQuestions;
        }
      }

      // If pool has fewer than 10 questions for this class level, fallback to all academic questions
      if (pool.length < 10) {
        const allAcademicRes = await query<AssessmentQuestionRow>(
          `SELECT * FROM assessment_questions WHERE module_id = 'academic' ORDER BY id ASC`
        );
        pool = allAcademicRes.rows;
      }

      // Group by subject to ensure balanced distribution
      const subjectMap: Record<string, AssessmentQuestionRow[]> = {};
      for (const q of pool) {
        const sub = q.subject || 'General';
        if (!subjectMap[sub]) subjectMap[sub] = [];
        subjectMap[sub].push(q);
      }

      const subjects = Object.keys(subjectMap);
      const chosenIds = new Set<number>();
      const balancedPick: AssessmentQuestionRow[] = [];

      // Round-robin selection across available subjects
      let subIndex = 0;
      let iterations = 0;
      const maxIterations = 200;

      while (balancedPick.length < 10 && iterations < maxIterations && subjects.length > 0) {
        const currentSub = subjects[subIndex % subjects.length];
        const subQuestions = subjectMap[currentSub];
        const available = subQuestions.filter(q => !chosenIds.has(q.id));

        if (available.length > 0) {
          const randomPick = available[crypto.randomInt(0, available.length)];
          chosenIds.add(randomPick.id);
          balancedPick.push(randomPick);
        }

        subIndex++;
        iterations++;
      }

      // Fallback: fill remaining if subjects ran out
      if (balancedPick.length < 10) {
        const remaining = pool.filter(q => !chosenIds.has(q.id));
        const shuffledRemaining = shuffleArray(remaining);
        for (const q of shuffledRemaining) {
          if (balancedPick.length >= 10) break;
          chosenIds.add(q.id);
          balancedPick.push(q);
        }
      }

      selectedQuestions = balancedPick.slice(0, 10);
      break;
    }

    case 'aptitude': {
      // 10 questions from applicable class level
      const targetClassLevel = currentClass >= 11 ? 12 : 10;
      let questionsRes = await query<AssessmentQuestionRow>(
        `SELECT * FROM assessment_questions 
         WHERE module_id = 'aptitude' AND class_level = $1
         ORDER BY id ASC`,
        [targetClassLevel]
      );

      let pool = questionsRes.rows;
      if (pool.length < 10) {
        const allAptRes = await query<AssessmentQuestionRow>(
          `SELECT * FROM assessment_questions WHERE module_id = 'aptitude' ORDER BY id ASC`
        );
        pool = allAptRes.rows;
      }

      // Sample 10 distinct questions
      const shuffled = shuffleArray(pool);
      selectedQuestions = shuffled.slice(0, 10);
      break;
    }

    case 'behavioural': {
      // 10 questions selected randomly from the 30 behavioural statements
      const questionsRes = await query<AssessmentQuestionRow>(
        `SELECT * FROM assessment_questions WHERE module_id = 'behavioural' ORDER BY id ASC`
      );

      const pool = questionsRes.rows;

      // Group by dimension to pick across dimensions
      const dimensionMap: Record<string, AssessmentQuestionRow[]> = {};
      for (const q of pool) {
        const dim = q.topic || 'General';
        if (!dimensionMap[dim]) dimensionMap[dim] = [];
        dimensionMap[dim].push(q);
      }

      const dimensions = Object.keys(dimensionMap);
      const chosenIds = new Set<number>();
      const balancedPick: AssessmentQuestionRow[] = [];

      // Ensure at least 1 from each dimension (6 dimensions)
      for (const dim of dimensions) {
        const dimQuestions = dimensionMap[dim];
        if (dimQuestions && dimQuestions.length > 0) {
          const pick = dimQuestions[crypto.randomInt(0, dimQuestions.length)];
          chosenIds.add(pick.id);
          balancedPick.push(pick);
        }
      }

      // Fill remaining 4 randomly from remaining pool
      const remaining = pool.filter(q => !chosenIds.has(q.id));
      const shuffledRemaining = shuffleArray(remaining);
      for (const q of shuffledRemaining) {
        if (balancedPick.length >= 10) break;
        chosenIds.add(q.id);
        balancedPick.push(q);
      }

      selectedQuestions = balancedPick.slice(0, 10);
      break;
    }

    case 'situational': {
      // 5 questions
      const questionsRes = await query<AssessmentQuestionRow>(
        `SELECT * FROM assessment_questions WHERE module_id = 'situational' ORDER BY id ASC`
      );

      const pool = questionsRes.rows;
      const shuffled = shuffleArray(pool);
      selectedQuestions = shuffled.slice(0, 5);
      break;
    }

    default:
      throw new Error(`Unsupported assessment module type: ${moduleId}`);
  }

  // Shuffle the final display order of the selected questions
  const randomizedQuestions = shuffleArray(selectedQuestions);

  // Fetch all options for the selected questions in batch
  const questionIds = randomizedQuestions.map(q => q.id);
  const optionsRes = await query<AssessmentQuestionOptionRow>(
    `SELECT * FROM assessment_question_options 
     WHERE question_id = ANY($1::int[]) 
     ORDER BY option_order ASC`,
    [questionIds]
  );

  const optionsByQuestionId: Record<number, AssessmentQuestionOptionRow[]> = {};
  for (const opt of optionsRes.rows) {
    if (!optionsByQuestionId[opt.question_id]) {
      optionsByQuestionId[opt.question_id] = [];
    }
    optionsByQuestionId[opt.question_id].push(opt);
  }

  // Prepare assigned questions with randomized options
  const prepared: PreparedAssignedQuestion[] = [];

  for (let i = 0; i < randomizedQuestions.length; i++) {
    const q = randomizedQuestions[i];
    const rawOptions = optionsByQuestionId[q.id] || [];

    // For behavioural: Likert scale retains fixed ascending score order (1 to 5)
    // For MCQ/Situational: shuffle options to prevent position bias
    let assignedOptions: AssignedOptionDTO[];
    if (moduleId.toLowerCase() === 'behavioural') {
      assignedOptions = rawOptions.map(opt => ({
        option_id: opt.id,
        option_text: opt.option_text,
        score_value: opt.score_value ? Number(opt.score_value) : null,
      }));
    } else {
      const shuffledOpts = shuffleArray(rawOptions);
      assignedOptions = shuffledOpts.map(opt => ({
        option_id: opt.id,
        option_text: opt.option_text,
      }));
    }

    prepared.push({
      question_id: q.id,
      display_order: i + 1,
      assigned_options: assignedOptions,
    });
  }

  return prepared;
}
