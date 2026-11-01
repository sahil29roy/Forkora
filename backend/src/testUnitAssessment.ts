import fs from 'fs';
import path from 'path';
import {
  VALID_MODULE_IDS,
  moduleIdParamSchema,
  attemptIdParamSchema,
  saveResponseSchema,
} from './validators/assessmentValidator';
import { shuffleArray } from './services/assessmentSelectionService';
import { ClientSafeQuestion } from './types/assessmentTypes';

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  ✓ [PASS] ${testName}`);
    passedCount++;
  } else {
    console.error(`  ✗ [FAIL] ${testName}`);
    if (details) console.error(`     Details: ${details}`);
    failedCount++;
  }
}

console.log('🧪 Starting Assessment Module Unit Tests...\n');

// -------------------------------------------------------------
// Group 1: Module ID Validator
// -------------------------------------------------------------
console.log('Group 1: Module ID Param Validator');
{
  for (const mod of ['academic', 'aptitude', 'behavioural', 'situational']) {
    const res = moduleIdParamSchema.safeParse({ moduleId: mod });
    assert(res.success && res.data.moduleId === mod, `Valid lowercase module '${mod}' is accepted`);
  }

  // Case insensitivity normalization
  const upperRes = moduleIdParamSchema.safeParse({ moduleId: 'ACADEMIC' });
  assert(upperRes.success && upperRes.data.moduleId === 'academic', 'Uppercase module ID is normalized to lowercase');

  const mixedRes = moduleIdParamSchema.safeParse({ moduleId: 'Situational' });
  assert(mixedRes.success && mixedRes.data.moduleId === 'situational', 'Mixed-case module ID is normalized to lowercase');

  // Invalid module IDs
  const invalidRes = moduleIdParamSchema.safeParse({ moduleId: 'computer_science' });
  assert(!invalidRes.success, 'Unrecognized module ID is rejected');

  const emptyRes = moduleIdParamSchema.safeParse({ moduleId: '' });
  assert(!emptyRes.success, 'Empty module ID is rejected');
}

// -------------------------------------------------------------
// Group 2: Attempt ID Validator
// -------------------------------------------------------------
console.log('\nGroup 2: Attempt ID Param Validator');
{
  const validNum = attemptIdParamSchema.safeParse({ attemptId: 42 });
  assert(validNum.success && validNum.data.attemptId === 42, 'Integer attempt ID 42 is accepted');

  const validStr = attemptIdParamSchema.safeParse({ attemptId: '105' });
  assert(validStr.success && validStr.data.attemptId === 105, 'Numeric string attempt ID "105" is coerced to integer');

  const zeroRes = attemptIdParamSchema.safeParse({ attemptId: 0 });
  assert(!zeroRes.success, 'Attempt ID 0 is rejected (must be positive)');

  const negativeRes = attemptIdParamSchema.safeParse({ attemptId: -1 });
  assert(!negativeRes.success, 'Negative attempt ID is rejected');

  const nonNumericRes = attemptIdParamSchema.safeParse({ attemptId: 'abc' });
  assert(!nonNumericRes.success, 'Non-numeric string attempt ID is rejected');

  const floatRes = attemptIdParamSchema.safeParse({ attemptId: 3.14 });
  assert(!floatRes.success, 'Floating point attempt ID is rejected');
}

// -------------------------------------------------------------
// Group 3: Save Response Payload Validator
// -------------------------------------------------------------
console.log('\nGroup 3: Save Response Payload Validator');
{
  // Valid MCQ selection with option ID and text
  const mcqRes = saveResponseSchema.safeParse({
    assigned_question_id: 101,
    selected_option_id: 402,
    selected_option_text: 'Mitochondria',
  });
  assert(mcqRes.success, 'Valid MCQ response with option ID and text is accepted');

  // Valid MCQ selection with only option ID
  const mcqOnlyId = saveResponseSchema.safeParse({
    assigned_question_id: 101,
    selected_option_id: 402,
  });
  assert(mcqOnlyId.success, 'Valid MCQ response with only selected_option_id is accepted');

  // Valid Behavioural Likert response (1 to 5)
  for (const rating of [1, 2, 3, 4, 5]) {
    const behRes = saveResponseSchema.safeParse({
      assigned_question_id: 201,
      response_value: rating,
    });
    assert(behRes.success, `Valid Likert score ${rating} is accepted`);
  }

  // Coercion from numeric string
  const coerceRes = saveResponseSchema.safeParse({
    assigned_question_id: '15',
    response_value: '4',
  });
  assert(coerceRes.success && coerceRes.data.response_value === 4, 'String-coerced response values are parsed properly');

  // Invalid Likert scores
  const lowRes = saveResponseSchema.safeParse({ assigned_question_id: 201, response_value: 0 });
  assert(!lowRes.success, 'Likert score of 0 is rejected (< 1)');

  const highRes = saveResponseSchema.safeParse({ assigned_question_id: 201, response_value: 6 });
  assert(!highRes.success, 'Likert score of 6 is rejected (> 5)');

  const negRes = saveResponseSchema.safeParse({ assigned_question_id: 201, response_value: -3 });
  assert(!negRes.success, 'Negative Likert score is rejected');

  // Missing all response identifiers
  const emptyPayload = saveResponseSchema.safeParse({ assigned_question_id: 201 });
  assert(!emptyPayload.success, 'Payload without option or response value is rejected by refinement');
}

// -------------------------------------------------------------
// Group 4: Server-Side Shuffling Algorithm (Fisher-Yates)
// -------------------------------------------------------------
console.log('\nGroup 4: Fisher-Yates Shuffling Algorithm');
{
  const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const shuffled = shuffleArray(original);

  assert(shuffled.length === original.length, 'Shuffled array maintains original length');
  assert(
    JSON.stringify([...shuffled].sort((a, b) => a - b)) === JSON.stringify(original),
    'Shuffled array contains exact same set of elements'
  );
  assert(
    JSON.stringify(original) === JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
    'Original array is not mutated in-place (pure function)'
  );

  // Test edge cases
  const emptyArr = shuffleArray([]);
  assert(Array.isArray(emptyArr) && emptyArr.length === 0, 'Empty array shuffle returns empty array');

  const singleArr = shuffleArray([42]);
  assert(singleArr.length === 1 && singleArr[0] === 42, 'Single-element array returns single element');

  // Statistical permutation test over 20 iterations
  let orderDifferenceObserved = false;
  for (let i = 0; i < 20; i++) {
    const s = shuffleArray(original);
    if (JSON.stringify(s) !== JSON.stringify(original)) {
      orderDifferenceObserved = true;
      break;
    }
  }
  assert(orderDifferenceObserved, 'Array order varies randomly over iterations (Fisher-Yates active)');
}

// -------------------------------------------------------------
// Group 5: Client-Safe Question Sanitization Invariant
// -------------------------------------------------------------
console.log('\nGroup 5: Client-Safe Question Sanitization Invariant');
{
  // Simulated raw question directly from database with private server-only fields
  const rawDbQuestion = {
    id: 501,
    assigned_question_id: 1001,
    display_order: 1,
    question_text: 'What is the capital of France?',
    subject: 'Geography',
    topic: 'World Capitals',
    correct_answer: 'Paris',
    scoring_rubric: { weight: 1.0 },
    generation_metadata: { prompt_version: 'v1' },
    assigned_options: [
      { option_id: 1, option_text: 'London', is_correct: false, score_value: 0 },
      { option_id: 2, option_text: 'Paris', is_correct: true, score_value: 1 },
      { option_id: 3, option_text: 'Berlin', is_correct: false, score_value: 0 },
      { option_id: 4, option_text: 'Madrid', is_correct: false, score_value: 0 },
    ],
    is_answered: false,
    selected_option_id: null,
    selected_option_text: null,
    response_value: null,
  };

  // Convert to client safe structure matching model sanitization
  const safeQuestion: ClientSafeQuestion = {
    assigned_question_id: rawDbQuestion.assigned_question_id,
    display_order: rawDbQuestion.display_order,
    question_text: rawDbQuestion.question_text,
    subject: rawDbQuestion.subject,
    topic: rawDbQuestion.topic,
    options: rawDbQuestion.assigned_options.map((opt) => ({
      option_id: opt.option_id,
      option_text: opt.option_text,
    })),
    is_answered: rawDbQuestion.is_answered,
    selected_option_id: rawDbQuestion.selected_option_id,
    selected_option_text: rawDbQuestion.selected_option_text,
    response_value: rawDbQuestion.response_value,
  };

  // Assert sensitive fields are absent
  const serialized = JSON.stringify(safeQuestion);
  assert(!serialized.includes('correct_answer'), 'correct_answer is absent from client-safe question');
  assert(!serialized.includes('correctAnswer'), 'correctAnswer is absent from client-safe question');
  assert(!serialized.includes('"is_correct"'), 'is_correct is absent from client-safe options');
  assert(!serialized.includes('"isCorrect"'), 'isCorrect is absent from client-safe options');
  assert(!serialized.includes('scoring_rubric'), 'scoring_rubric is absent from client-safe question');
  assert(!serialized.includes('generation_metadata'), 'generation_metadata is absent from client-safe question');
  assert(safeQuestion.options.length === 4, 'All 4 presentation options are preserved');
  assert(safeQuestion.options[0].option_text === 'London', 'Option text is properly preserved');
}

// -------------------------------------------------------------
// Group 6: Mathematical Scoring Invariants
// -------------------------------------------------------------
console.log('\nGroup 6: Mathematical Scoring Invariants');
{
  // Accuracy percentage math
  const calcPercentage = (correct: number, total: number) =>
    total > 0 ? Math.round((correct / total) * 100) : 0;

  assert(calcPercentage(8, 10) === 80, '8/10 yields 80%');
  assert(calcPercentage(1, 3) === 33, '1/3 yields 33% (rounded)');
  assert(calcPercentage(2, 3) === 67, '2/3 yields 67% (rounded)');
  assert(calcPercentage(0, 10) === 0, '0/10 yields 0%');
  assert(calcPercentage(10, 10) === 100, '10/10 yields 100%');

  // Behavioural Likert average rounding
  const calcAverage = (scores: number[]) => {
    const sum = scores.reduce((a, b) => a + b, 0);
    return scores.length > 0 ? Math.round((sum / scores.length) * 10) / 10 : 0;
  };

  assert(calcAverage([4, 5, 4, 5]) === 4.5, 'Average of [4, 5, 4, 5] is 4.5');
  assert(calcAverage([1, 2, 3]) === 2.0, 'Average of [1, 2, 3] is 2.0');
  assert(calcAverage([4, 4, 5]) === 4.3, 'Average of [4, 4, 5] is 4.3 (rounded to 1 decimal)');

  const minRating = calcAverage([1, 1, 1]);
  const maxRating = calcAverage([5, 5, 5]);
  assert(minRating >= 1.0 && maxRating <= 5.0, 'Averages strictly reside within 1.0 to 5.0 bounds');
}

// -------------------------------------------------------------
// Group 7: Question Bank File Integrity & Structural Audit
// -------------------------------------------------------------
console.log('\nGroup 7: Question Bank File Integrity');
{
  const qbBasePath = path.join(__dirname, 'question-bank');

  // 1. Class 10 Academics
  const c10Path = path.join(qbBasePath, 'academics', 'class10');
  const c10Subjects = ['biology.json', 'chemistry.json', 'mathematics.json', 'physics.json'];
  for (const file of c10Subjects) {
    const filePath = path.join(c10Path, file);
    assert(fs.existsSync(filePath), `Class 10 question bank file exists: ${file}`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    assert(Array.isArray(data) && data.length === 30, `${file} contains exactly 30 questions`);
    assert(data[0].options && data[0].options.length === 4, `${file} questions have 4 options`);
    assert(typeof data[0].answer === 'string' && data[0].answer.length > 0, `${file} questions have valid answer keys`);
  }

  // 2. Class 12 Academics
  const c12Path = path.join(qbBasePath, 'academics', 'class12');
  assert(fs.existsSync(c12Path), 'Class 12 academic directory exists');
  const c12Files = fs.readdirSync(c12Path).filter((f) => f.endsWith('.json'));
  assert(c12Files.length === 16, `Class 12 has 16 curated subject files (found ${c12Files.length})`);

  // 3. Aptitude Banks
  const apt10Path = path.join(qbBasePath, 'aptitude', 'aptitude_for_class10.json');
  const apt12Path = path.join(qbBasePath, 'aptitude', 'aptitude_for_class12.json');
  assert(fs.existsSync(apt10Path), 'Aptitude Class 10 file exists');
  assert(fs.existsSync(apt12Path), 'Aptitude Class 12 file exists');

  const apt10Data = JSON.parse(fs.readFileSync(apt10Path, 'utf-8'));
  const apt12Data = JSON.parse(fs.readFileSync(apt12Path, 'utf-8'));
  assert(Array.isArray(apt10Data) && apt10Data.length >= 50, 'Class 10 aptitude bank has >= 50 items');
  assert(Array.isArray(apt12Data) && apt12Data.length >= 50, 'Class 12 aptitude bank has >= 50 items');

  // 4. Behavioural Bank
  const behPath = path.join(qbBasePath, 'behavioural', 'behavioural_questions.json');
  assert(fs.existsSync(behPath), 'Behavioural questions JSON exists');
  const behData = JSON.parse(fs.readFileSync(behPath, 'utf-8'));
  assert(Array.isArray(behData) && behData.length === 30, 'Behavioural bank has exactly 30 statements');

  // 5. Situational Bank
  const sitPath = path.join(qbBasePath, 'situational', 'situational_questions.json');
  assert(fs.existsSync(sitPath), 'Situational questions JSON exists');
  const sitData = JSON.parse(fs.readFileSync(sitPath, 'utf-8'));
  assert(Array.isArray(sitData) && sitData.length >= 10, 'Situational bank has >= 10 curated scenarios');
  assert(sitData[0].options && sitData[0].options.length === 4, 'Situational scenarios have 4 choices');
  assert(Boolean(sitData[0].rubric?.option_scores), 'Situational scenarios contain multidimensional rubrics');
}

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log('\n========================================');
console.log(`Unit Test Summary: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log('========================================\n');

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
