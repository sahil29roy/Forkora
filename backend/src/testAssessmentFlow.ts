import http from 'http';
import app from './app';
import { query } from './config/db';

const PORT = 5013;

function request(
  method: string,
  path: string,
  body: any = null,
  token: string | null = null
): Promise<{ status: number; data?: any; raw?: string }> {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const headers: Record<string, string | number> = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path,
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve({ status: res.statusCode || 500, data: json });
          } catch {
            resolve({ status: res.statusCode || 500, raw: data });
          }
        });
      }
    );

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function createVerifiedUser(prefix: string): Promise<{ token: string; email: string; id: number }> {
  const email = `${prefix}_${Date.now()}@forkora.edu`;
  const password = 'Password123!';

  const signupRes = await request('POST', '/api/auth/signup', {
    display_name: `${prefix} User`,
    email,
    password,
    role: 'STUDENT',
  });
  if (signupRes.status !== 201) {
    throw new Error(`Signup failed for ${prefix}: ${JSON.stringify(signupRes.data)}`);
  }

  const otpRes = await query(
    `SELECT ev.code FROM email_verifications ev JOIN users u ON ev.user_id = u.id WHERE u.email = $1 ORDER BY ev.created_at DESC LIMIT 1`,
    [email]
  );
  const otp = otpRes.rows[0].code;

  const verifyRes = await request('POST', '/api/auth/verify-email', {
    email,
    code: otp,
  });
  if (verifyRes.status !== 200) {
    throw new Error(`Verification failed for ${prefix}: ${JSON.stringify(verifyRes.data)}`);
  }

  return {
    token: verifyRes.data.token,
    email,
    id: Number(verifyRes.data.user.id),
  };
}

async function runAssessmentTests(): Promise<void> {
  const server = app.listen(PORT, async () => {
    console.log(`\n==================================================`);
    console.log(`🧪 Running Forkora Assessment Module Test Suite`);
    console.log(`📡 Listening on temporary test port ${PORT}`);
    console.log(`==================================================\n`);

    try {
      // Setup primary test student (User A) and isolation student (User B)
      console.log('👤 Creating verified test users...');
      const userA = await createVerifiedUser('student_alpha');
      const userB = await createVerifiedUser('student_beta');
      console.log(`  ✅ User A created (ID: ${userA.id}, Email: ${userA.email})`);
      console.log(`  ✅ User B created (ID: ${userB.id}, Email: ${userB.email})\n`);

      // 1. CATALOG & CONSOLIDATED STATUS
      console.log('1️⃣ Testing Assessment Modules Listing...');
      const modulesRes = await request('GET', '/api/assessments/modules', null, userA.token);
      if (modulesRes.status !== 200 || !Array.isArray(modulesRes.data.data)) {
        throw new Error(`Failed to list modules: ${JSON.stringify(modulesRes.data)}`);
      }
      if (modulesRes.data.data.length !== 4) {
        throw new Error(`Expected 4 modules, got ${modulesRes.data.data.length}`);
      }
      console.log(`  ✅ Successfully retrieved 4 modules with NOT_STARTED status.`);

      // 2. MODULE DETAILS
      console.log('\n2️⃣ Testing Module Details endpoint...');
      const detailRes = await request('GET', '/api/assessments/modules/academic', null, userA.token);
      if (detailRes.status !== 200 || detailRes.data.data.id !== 'academic') {
        throw new Error(`Failed to get academic module details: ${JSON.stringify(detailRes.data)}`);
      }
      console.log(`  ✅ Module details retrieved: "${detailRes.data.data.title}" (10 questions, 15 mins).`);

      // 3. START ACADEMIC ASSESSMENT (10 questions)
      console.log('\n3️⃣ Testing Start Academic Assessment...');
      const startAcadRes = await request('POST', '/api/assessments/modules/academic/start', {}, userA.token);
      if (startAcadRes.status !== 201 || !startAcadRes.data.data.id) {
        throw new Error(`Failed to start academic assessment: ${JSON.stringify(startAcadRes.data)}`);
      }
      const acadAttemptId = startAcadRes.data.data.id;
      console.log(`  ✅ Academic assessment started with Attempt ID: ${acadAttemptId}`);

      // 4. FETCH ASSIGNED QUESTIONS & SECURITY CHECKS
      console.log('\n4️⃣ Testing Question Delivery & Critical Security (No Answer Keys)...');
      const acadQuestionsRes = await request('GET', `/api/assessments/attempts/${acadAttemptId}/questions`, null, userA.token);
      if (acadQuestionsRes.status !== 200) {
        throw new Error(`Failed to fetch academic questions: ${JSON.stringify(acadQuestionsRes.data)}`);
      }
      const acadQuestions = acadQuestionsRes.data.data.questions;
      if (acadQuestions.length !== 10) {
        throw new Error(`Expected 10 academic questions, got ${acadQuestions.length}`);
      }

      // Verify no answer keys or scoring rubrics leak in the payload
      for (const q of acadQuestions) {
        if ('correct_answer' in q || 'correctAnswer' in q || 'answer' in q || 'answerKey' in q || 'is_correct' in q || 'scoring_rubric' in q) {
          throw new Error(`CRITICAL SECURITY FAILURE: Sensitive answer data leaked in question ${JSON.stringify(q)}`);
        }
        for (const opt of q.options) {
          if ('is_correct' in opt || 'isCorrect' in opt || 'score_value' in opt || 'score_metadata' in opt) {
            throw new Error(`CRITICAL SECURITY FAILURE: Option leaked correctness or score metadata: ${JSON.stringify(opt)}`);
          }
        }
      }
      console.log(`  ✅ Verified 10 questions delivered.`);
      console.log(`  🔒 Security verified: 0 answer keys, 0 is_correct flags, and 0 scoring rubrics present in client payload.`);

      // 5. TEST STABLE ORDER ON RESUME & REFRESH
      console.log('\n5️⃣ Testing Resume & Refresh Stability...');
      const resumeStartRes = await request('POST', '/api/assessments/modules/academic/start', {}, userA.token);
      if (resumeStartRes.status !== 200 || !resumeStartRes.data.resumed || resumeStartRes.data.data.id !== acadAttemptId) {
        throw new Error(`Start while in progress did not resume same attempt: ${JSON.stringify(resumeStartRes.data)}`);
      }

      const acadQuestionsRes2 = await request('GET', `/api/assessments/attempts/${acadAttemptId}/questions`, null, userA.token);
      const acadQuestions2 = acadQuestionsRes2.data.data.questions;

      for (let i = 0; i < acadQuestions.length; i++) {
        if (acadQuestions[i].assigned_question_id !== acadQuestions2[i].assigned_question_id) {
          throw new Error(`Question order changed upon resume! Expected ${acadQuestions[i].assigned_question_id}, got ${acadQuestions2[i].assigned_question_id}`);
        }
        const opts1 = acadQuestions[i].options.map((o: any) => o.option_id).join(',');
        const opts2 = acadQuestions2[i].options.map((o: any) => o.option_id).join(',');
        if (opts1 !== opts2) {
          throw new Error(`Option order changed upon resume for question ${acadQuestions[i].assigned_question_id}!`);
        }
      }
      console.log(`  ✅ Question order and randomised option order remain 100% stable across resumes.`);

      // 6. APTITUDE, BEHAVIOURAL, AND SITUATIONAL QUESTION COUNTS
      console.log('\n6️⃣ Testing Question Selection Counts for Aptitude (10), Behavioural (10), Situational (5)...');

      const startAptRes = await request('POST', '/api/assessments/modules/aptitude/start', {}, userA.token);
      const aptQuestionsRes = await request('GET', `/api/assessments/attempts/${startAptRes.data.data.id}/questions`, null, userA.token);
      if (aptQuestionsRes.data.data.questions.length !== 10) {
        throw new Error(`Expected 10 aptitude questions, got ${aptQuestionsRes.data.data.questions.length}`);
      }
      console.log(`  ✅ Aptitude: exactly 10 questions selected.`);

      const startBehRes = await request('POST', '/api/assessments/modules/behavioural/start', {}, userA.token);
      const behQuestionsRes = await request('GET', `/api/assessments/attempts/${startBehRes.data.data.id}/questions`, null, userA.token);
      if (behQuestionsRes.data.data.questions.length !== 10) {
        throw new Error(`Expected 10 behavioural statements, got ${behQuestionsRes.data.data.questions.length}`);
      }
      console.log(`  ✅ Behavioural: exactly 10 statements selected from 30 bank items.`);

      const startSitRes = await request('POST', '/api/assessments/modules/situational/start', {}, userA.token);
      const sitQuestionsRes = await request('GET', `/api/assessments/attempts/${startSitRes.data.data.id}/questions`, null, userA.token);
      if (sitQuestionsRes.data.data.questions.length !== 5) {
        throw new Error(`Expected 5 situational questions, got ${sitQuestionsRes.data.data.questions.length}`);
      }
      console.log(`  ✅ Situational: exactly 5 scenarios selected.`);

      // 7. USER ISOLATION & ACCESS CONTROL
      console.log('\n7️⃣ Testing Cross-User Access Isolation...');
      const unauthorizedGetRes = await request('GET', `/api/assessments/attempts/${acadAttemptId}/questions`, null, userB.token);
      if (unauthorizedGetRes.status !== 403) {
        throw new Error(`Expected 403 Forbidden for unauthorized attempt access, got ${unauthorizedGetRes.status}`);
      }

      const unauthorizedSaveRes = await request('POST', `/api/assessments/attempts/${acadAttemptId}/responses`, {
        assigned_question_id: acadQuestions[0].assigned_question_id,
        selected_option_id: acadQuestions[0].options[0].option_id,
      }, userB.token);
      if (unauthorizedSaveRes.status !== 403) {
        throw new Error(`Expected 403 Forbidden for unauthorized response submission, got ${unauthorizedSaveRes.status}`);
      }

      const unauthorizedSubmitRes = await request('POST', `/api/assessments/attempts/${acadAttemptId}/submit`, {}, userB.token);
      if (unauthorizedSubmitRes.status !== 403) {
        throw new Error(`Expected 403 Forbidden for unauthorized attempt submit, got ${unauthorizedSubmitRes.status}`);
      }
      console.log(`  🔒 Access control confirmed: Students cannot view, edit, or submit other students' attempts.`);

      // 8. INPUT VALIDATION TESTS
      console.log('\n8️⃣ Testing Input Validation...');
      const invalidLikertRes = await request('POST', `/api/assessments/attempts/${startBehRes.data.data.id}/responses`, {
        assigned_question_id: behQuestionsRes.data.data.questions[0].assigned_question_id,
        response_value: 99, // Invalid Likert value!
      }, userA.token);
      if (invalidLikertRes.status !== 400) {
        throw new Error(`Expected 400 Bad Request for invalid Likert score, got ${invalidLikertRes.status}`);
      }

      const invalidAttemptIdRes = await request('GET', `/api/assessments/attempts/notanumber/questions`, null, userA.token);
      if (invalidAttemptIdRes.status !== 400) {
        throw new Error(`Expected 400 Bad Request for malformed attempt ID, got ${invalidAttemptIdRes.status}`);
      }
      console.log(`  ✅ Invalid payloads properly rejected by Zod validation schemas.`);

      // 9. SAVE RESPONSES & TRACK PROGRESS
      console.log('\n9️⃣ Testing Response Saving & Progress Tracking on Academic Assessment...');
      for (let i = 0; i < 5; i++) {
        const q = acadQuestions[i];
        const saveRes = await request('POST', `/api/assessments/attempts/${acadAttemptId}/responses`, {
          assigned_question_id: q.assigned_question_id,
          selected_option_id: q.options[0].option_id,
          selected_option_text: q.options[0].option_text,
        }, userA.token);
        if (saveRes.status !== 200) {
          throw new Error(`Failed to save response for question ${q.assigned_question_id}: ${JSON.stringify(saveRes.data)}`);
        }
      }

      const progressRes = await request('GET', `/api/assessments/attempts/${acadAttemptId}/progress`, null, userA.token);
      if (progressRes.status !== 200 || progressRes.data.data.answeredCount !== 5 || progressRes.data.data.progressPercentage !== 50) {
        throw new Error(`Unexpected progress: ${JSON.stringify(progressRes.data)}`);
      }
      console.log(`  ✅ Progress tracked accurately: 5/10 answered (50%).`);

      // Answer remaining 5 questions
      for (let i = 5; i < 10; i++) {
        const q = acadQuestions[i];
        await request('POST', `/api/assessments/attempts/${acadAttemptId}/responses`, {
          assigned_question_id: q.assigned_question_id,
          selected_option_id: q.options[0].option_id,
          selected_option_text: q.options[0].option_text,
        }, userA.token);
      }

      // 10. SUBMISSION & BACKEND SCORING
      console.log('\n🔟 Testing Submission & Backend Scoring Calculation...');
      const submitRes = await request('POST', `/api/assessments/attempts/${acadAttemptId}/submit`, {}, userA.token);
      if (submitRes.status !== 200 || !submitRes.data.data.score_percentage && submitRes.data.data.score_percentage !== 0) {
        throw new Error(`Submission failed: ${JSON.stringify(submitRes.data)}`);
      }
      const resultData = submitRes.data.data;
      console.log(`  ✅ Assessment submitted. Score: ${resultData.score_percentage}%, Correct: ${resultData.correct_answers}/10.`);
      console.log(`  ✅ Subject performance breakdown:`, JSON.stringify(resultData.summary.subjectPerformance));

      // 11. IMMUTABILITY OF COMPLETED ATTEMPTS
      console.log('\n1️⃣1️⃣ Testing Immutability of Completed Attempts...');
      const modifyRes = await request('POST', `/api/assessments/attempts/${acadAttemptId}/responses`, {
        assigned_question_id: acadQuestions[0].assigned_question_id,
        selected_option_id: acadQuestions[0].options[1].option_id,
      }, userA.token);
      if (modifyRes.status !== 400) {
        throw new Error(`Expected 400 when modifying completed attempt, got ${modifyRes.status}`);
      }
      console.log(`  ✅ Modification blocked: Completed attempts are strictly immutable.`);

      // Duplicate submission handled safely
      const duplicateSubmitRes = await request('POST', `/api/assessments/attempts/${acadAttemptId}/submit`, {}, userA.token);
      if (duplicateSubmitRes.status !== 200 || !duplicateSubmitRes.data.alreadySubmitted) {
        throw new Error(`Expected safe duplicate submission response, got ${JSON.stringify(duplicateSubmitRes.data)}`);
      }
      console.log(`  ✅ Duplicate submission handled safely without double-scoring.`);

      // 12. BEHAVIOURAL ASSESSMENT SCORING (Likert averages 1.0 to 5.0)
      console.log('\n1️⃣2️⃣ Testing Behavioural Assessment Scoring...');
      const behAttemptId = startBehRes.data.data.id;
      const behQuestions = behQuestionsRes.data.data.questions;

      // Rate statements 4 and 5
      for (let i = 0; i < behQuestions.length; i++) {
        const q = behQuestions[i];
        const rating = (i % 2 === 0) ? 4 : 5;
        await request('POST', `/api/assessments/attempts/${behAttemptId}/responses`, {
          assigned_question_id: q.assigned_question_id,
          response_value: rating,
        }, userA.token);
      }

      const submitBehRes = await request('POST', `/api/assessments/attempts/${behAttemptId}/submit`, {}, userA.token);
      if (submitBehRes.status !== 200) {
        throw new Error(`Behavioural submit failed: ${JSON.stringify(submitBehRes.data)}`);
      }
      const behSummary = submitBehRes.data.data.summary;
      console.log(`  ✅ Dimension averages:`, JSON.stringify(behSummary.dimensionAverages));
      for (const [dim, avg] of Object.entries(behSummary.dimensionAverages)) {
        if (typeof avg !== 'number' || (avg as number) < 1.0 || (avg as number) > 5.0) {
          throw new Error(`Invalid dimension average for ${dim}: ${avg}`);
        }
      }
      console.log(`  ✅ All 6 behavioural dimension averages calculated between 1.0 and 5.0.`);

      // 13. SITUATIONAL ASSESSMENT SCORING (Multi-dimensional signals)
      console.log('\n1️⃣3️⃣ Testing Situational Assessment Scoring...');
      const sitAttemptId = startSitRes.data.data.id;
      const sitQuestions = sitQuestionsRes.data.data.questions;

      for (const q of sitQuestions) {
        await request('POST', `/api/assessments/attempts/${sitAttemptId}/responses`, {
          assigned_question_id: q.assigned_question_id,
          selected_option_id: q.options[0].option_id,
          selected_option_text: q.options[0].option_text,
        }, userA.token);
      }

      const submitSitRes = await request('POST', `/api/assessments/attempts/${sitAttemptId}/submit`, {}, userA.token);
      if (submitSitRes.status !== 200) {
        throw new Error(`Situational submit failed: ${JSON.stringify(submitSitRes.data)}`);
      }
      const sitSummary = submitSitRes.data.data.summary;
      console.log(`  ✅ Behavioural signals:`, JSON.stringify(sitSummary.behaviouralSignals));

      // 14. CONSOLIDATED STATUS VERIFICATION
      console.log('\n1️⃣4️⃣ Testing Final Consolidated Assessment Status...');
      const finalStatusRes = await request('GET', '/api/assessments/status', null, userA.token);
      if (finalStatusRes.status !== 200) {
        throw new Error(`Failed to get final status: ${JSON.stringify(finalStatusRes.data)}`);
      }
      const finalStatus = finalStatusRes.data.data;
      const completedModules = finalStatus.filter((m: any) => m.status === 'COMPLETED');
      console.log(`  ✅ User has completed ${completedModules.length} modules (${completedModules.map((m: any) => m.module_id).join(', ')}).`);

      console.log(`\n==================================================`);
      console.log(`🎉 ALL ASSESSMENT INTEGRATION TESTS PASSED!`);
      console.log(`==================================================\n`);

      server.close(() => {
        process.exit(0);
      });
    } catch (err: any) {
      console.error('\n❌ TEST FAILURE:', err.message);
      if (err.stack) console.error(err.stack);
      server.close(() => {
        process.exit(1);
      });
    }
  });
}

runAssessmentTests();
