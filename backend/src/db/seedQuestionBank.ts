import fs from 'fs';
import path from 'path';
import { pool, query } from '../config/db';

interface RawMCQQuestion {
  id?: number;
  subject?: string;
  topic?: string;
  difficulty?: string;
  question: string;
  options: string[];
  answer?: string;
}

interface RawBehaviouralQuestion {
  id?: number;
  category?: string;
  topic?: string;
  question: string;
  statement?: string;
  options: string[];
  scale?: { score: number; response: string }[];
}

interface RawSituationalQuestion {
  id?: number;
  topic: string;
  difficulty?: string;
  scenario: string;
  question: string;
  options: string[];
  rubric: {
    option_scores: Record<string, number>[];
  };
}

export async function seedQuestionBank(force = false): Promise<{ questionsCount: number; optionsCount: number }> {
  // Check if questions already exist
  const existingCountRes = await query<{ count: string }>('SELECT COUNT(*) AS count FROM assessment_questions');
  const existingCount = parseInt(existingCountRes.rows[0].count, 10);

  if (existingCount > 0 && !force) {
    console.log(`[Seed] Question bank already populated (${existingCount} questions found). Skipping.`);
    return { questionsCount: existingCount, optionsCount: 0 };
  }

  const client = await pool.connect();
  const qbBaseDir = path.join(__dirname, '..', 'question-bank');

  try {
    await client.query('BEGIN');

    if (force) {
      console.log('[Seed] Force mode active. Truncating assessment_questions...');
      await client.query('TRUNCATE assessment_questions CASCADE;');
    }

    let totalQuestionsInserted = 0;
    let totalOptionsInserted = 0;

    // 1. Seed Academic Class 10
    const class10Dir = path.join(qbBaseDir, 'academics', 'class10');
    if (fs.existsSync(class10Dir)) {
      const files = fs.readdirSync(class10Dir).filter(f => f.endsWith('.json'));
      for (const file of files) {
        const filePath = path.join(class10Dir, file);
        const data: RawMCQQuestion[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const defaultSubject = file.replace('.json', '');

        for (const item of data) {
          const subject = item.subject || defaultSubject.charAt(0).toUpperCase() + defaultSubject.slice(1);
          const qRes = await client.query(
            `INSERT INTO assessment_questions (
              module_id, source, subject, topic, difficulty, class_level, question_text, correct_answer
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
            ['academic', 'CURATED', subject, item.topic || 'General', item.difficulty || 'Moderate', 10, item.question, item.answer || null]
          );
          const qId = qRes.rows[0].id;
          totalQuestionsInserted++;

          for (let i = 0; i < item.options.length; i++) {
            const opt = item.options[i];
            const isCorrect = item.answer ? opt.trim().toLowerCase() === item.answer.trim().toLowerCase() : false;
            await client.query(
              `INSERT INTO assessment_question_options (question_id, option_text, option_order, is_correct)
               VALUES ($1, $2, $3, $4)`,
              [qId, opt, i, isCorrect]
            );
            totalOptionsInserted++;
          }
        }
      }
    }

    // 2. Seed Academic Class 12
    const class12Dir = path.join(qbBaseDir, 'academics', 'class12');
    if (fs.existsSync(class12Dir)) {
      const files = fs.readdirSync(class12Dir).filter(f => f.endsWith('.json'));
      for (const file of files) {
        const filePath = path.join(class12Dir, file);
        const data: RawMCQQuestion[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const defaultSubject = file.replace('.json', '').replace('-', ' ');

        for (const item of data) {
          const subject = item.subject || defaultSubject;
          const qRes = await client.query(
            `INSERT INTO assessment_questions (
              module_id, source, subject, topic, difficulty, class_level, question_text, correct_answer
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
            ['academic', 'CURATED', subject, item.topic || 'General', item.difficulty || 'Moderate', 12, item.question, item.answer || null]
          );
          const qId = qRes.rows[0].id;
          totalQuestionsInserted++;

          for (let i = 0; i < item.options.length; i++) {
            const opt = item.options[i];
            const isCorrect = item.answer ? opt.trim().toLowerCase() === item.answer.trim().toLowerCase() : false;
            await client.query(
              `INSERT INTO assessment_question_options (question_id, option_text, option_order, is_correct)
               VALUES ($1, $2, $3, $4)`,
              [qId, opt, i, isCorrect]
            );
            totalOptionsInserted++;
          }
        }
      }
    }

    // 3. Seed Aptitude (Class 10 & 12)
    const apt10Path = path.join(qbBaseDir, 'aptitude', 'aptitude_for_class10.json');
    if (fs.existsSync(apt10Path)) {
      const data: RawMCQQuestion[] = JSON.parse(fs.readFileSync(apt10Path, 'utf-8'));
      for (const item of data) {
        const qRes = await client.query(
          `INSERT INTO assessment_questions (
            module_id, source, subject, topic, difficulty, class_level, question_text, correct_answer
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
          ['aptitude', 'CURATED', 'Aptitude', item.topic || 'General Reasoning', item.difficulty || 'Moderate', 10, item.question, item.answer || null]
        );
        const qId = qRes.rows[0].id;
        totalQuestionsInserted++;

        for (let i = 0; i < item.options.length; i++) {
          const opt = item.options[i];
          const isCorrect = item.answer ? opt.trim().toLowerCase() === item.answer.trim().toLowerCase() : false;
          await client.query(
            `INSERT INTO assessment_question_options (question_id, option_text, option_order, is_correct)
             VALUES ($1, $2, $3, $4)`,
            [qId, opt, i, isCorrect]
          );
          totalOptionsInserted++;
        }
      }
    }

    const apt12Path = path.join(qbBaseDir, 'aptitude', 'aptitude_for_class12.json');
    if (fs.existsSync(apt12Path)) {
      const data: RawMCQQuestion[] = JSON.parse(fs.readFileSync(apt12Path, 'utf-8'));
      for (const item of data) {
        const qRes = await client.query(
          `INSERT INTO assessment_questions (
            module_id, source, subject, topic, difficulty, class_level, question_text, correct_answer
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
          ['aptitude', 'CURATED', 'Aptitude', item.topic || 'Advanced Reasoning', item.difficulty || 'Moderate', 12, item.question, item.answer || null]
        );
        const qId = qRes.rows[0].id;
        totalQuestionsInserted++;

        for (let i = 0; i < item.options.length; i++) {
          const opt = item.options[i];
          const isCorrect = item.answer ? opt.trim().toLowerCase() === item.answer.trim().toLowerCase() : false;
          await client.query(
            `INSERT INTO assessment_question_options (question_id, option_text, option_order, is_correct)
             VALUES ($1, $2, $3, $4)`,
            [qId, opt, i, isCorrect]
          );
          totalOptionsInserted++;
        }
      }
    }

    // 4. Seed Behavioural Assessment Questions
    const behPath = path.join(qbBaseDir, 'behavioural', 'behavioural_questions.json');
    if (fs.existsSync(behPath)) {
      const data: RawBehaviouralQuestion[] = JSON.parse(fs.readFileSync(behPath, 'utf-8'));
      for (const item of data) {
        const dimension = item.category || item.topic || 'General Behavioural';
        const qRes = await client.query(
          `INSERT INTO assessment_questions (
            module_id, source, subject, topic, difficulty, question_text, scoring_rubric
          ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
          ['behavioural', 'CURATED', 'Behavioural', dimension, 'Moderate', item.statement || item.question, JSON.stringify({ dimension })]
        );
        const qId = qRes.rows[0].id;
        totalQuestionsInserted++;

        const scale = item.scale || [
          { score: 1, response: 'Strongly Disagree' },
          { score: 2, response: 'Disagree' },
          { score: 3, response: 'Neither Agree nor Disagree' },
          { score: 4, response: 'Agree' },
          { score: 5, response: 'Strongly Agree' },
        ];

        for (let i = 0; i < scale.length; i++) {
          await client.query(
            `INSERT INTO assessment_question_options (question_id, option_text, option_order, is_correct, score_value)
             VALUES ($1, $2, $3, $4, $5)`,
            [qId, scale[i].response, i, false, scale[i].score]
          );
          totalOptionsInserted++;
        }
      }
    }

    // 5. Seed Situational Assessment Questions
    const sitPath = path.join(qbBaseDir, 'situational', 'situational_questions.json');
    if (fs.existsSync(sitPath)) {
      const data: RawSituationalQuestion[] = JSON.parse(fs.readFileSync(sitPath, 'utf-8'));
      for (const item of data) {
        const fullPrompt = `${item.scenario}\n\n${item.question}`;
        const qRes = await client.query(
          `INSERT INTO assessment_questions (
            module_id, source, subject, topic, difficulty, question_text, scoring_rubric
          ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
          ['situational', 'CURATED', 'Situational', item.topic, item.difficulty || 'Moderate', fullPrompt, JSON.stringify(item.rubric)]
        );
        const qId = qRes.rows[0].id;
        totalQuestionsInserted++;

        for (let i = 0; i < item.options.length; i++) {
          const optScore = item.rubric.option_scores[i] || {};
          await client.query(
            `INSERT INTO assessment_question_options (question_id, option_text, option_order, is_correct, score_metadata)
             VALUES ($1, $2, $3, $4, $5)`,
            [qId, item.options[i], i, false, JSON.stringify(optScore)]
          );
          totalOptionsInserted++;
        }
      }
    }

    await client.query('COMMIT');
    console.log(`[Seed Complete] Inserted ${totalQuestionsInserted} questions and ${totalOptionsInserted} options successfully.`);
    return { questionsCount: totalQuestionsInserted, optionsCount: totalOptionsInserted };
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('[Seed Error] Failed to seed question bank:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

// Allow CLI execution: tsx src/db/seedQuestionBank.ts
if (require.main === module) {
  seedQuestionBank(process.argv.includes('--force'))
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
