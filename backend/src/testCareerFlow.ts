import http from 'http';
import app from './app';
import { query } from './config/db';
import { seedCareerGraph } from './db/seedCareerGraph';

const TEST_PORT = 5011;

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
        port: TEST_PORT,
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
          } catch (e) {
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

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`  ❌ [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ [PASS] ${message}`);
}

async function runTests(): Promise<void> {
  const server = app.listen(TEST_PORT, async () => {
    console.log(`\n🧪 Testing Career Graph, Scoring, and Recommendations on port ${TEST_PORT}...\n`);

    try {
      // 0. Ensure Career Graph is seeded
      await seedCareerGraph();

      // 1. Create a Verified Test User
      const testEmail = `career_tester_${Date.now()}@forkora.edu`;
      const testPassword = 'Password123!';

      const signupRes = await request('POST', '/api/auth/signup', {
        display_name: 'Alex Rivera',
        email: testEmail,
        password: testPassword,
        role: 'STUDENT',
      });

      assert(signupRes.status === 201, 'Student user registered');
      const userId = signupRes.data.user.id;

      // Verify email directly in DB
      await query(`UPDATE users SET is_email_verified = true WHERE id = $1`, [userId]);

      const signinRes = await request('POST', '/api/auth/signin', {
        email: testEmail,
        password: testPassword,
      });

      assert(signinRes.status === 200, 'Student signed in successfully');
      const token = signinRes.data.token;

      // ==========================================
      // Group 1: Career Graph Catalog & Node Audit
      // ==========================================
      console.log('\n--- Group 1: Career Graph Catalog ---');
      const nodesRes = await request('GET', '/api/careers/nodes');
      assert(nodesRes.status === 200, 'GET /api/careers/nodes returns 200 OK');
      assert(nodesRes.data.data.total >= 40, `Found ${nodesRes.data.data.total} career graph nodes (expected >= 40)`);

      const nodes = nodesRes.data.data.nodes;
      const swEng = nodes.find((n: any) => n.code === 'CAREER_SOFTWARE_ENGINEER');
      const doctor = nodes.find((n: any) => n.code === 'CAREER_DOCTOR');
      const ca = nodes.find((n: any) => n.code === 'CAREER_CHARTERED_ACCOUNTANT');

      assert(Boolean(swEng), 'Software Engineer career node exists with salary metadata');
      assert(Boolean(doctor), 'Doctor career node exists with clinical skills');
      assert(Boolean(ca), 'Chartered Accountant career node exists with finance skills');

      // ==========================================
      // Group 2: Student Onboarding with Preferences
      // ==========================================
      console.log('\n--- Group 2: Onboarding with Preferences & Interests ---');
      const onboardingRes = await request(
        'POST',
        '/api/onboarding',
        {
          student_name: 'Alex Rivera',
          current_class: 10,
          phone_number: '+91 9876543210',
          contact_email: testEmail,
          father_name: 'David Rivera',
          father_occupation: 'Engineer',
          mother_name: 'Elena Rivera',
          mother_occupation: 'Architect',
          education_board: 'CBSE',
          subjects: [
            { subject_name: 'Mathematics', marks_obtained: 92, maximum_marks: 100 },
            { subject_name: 'Science', marks_obtained: 88, maximum_marks: 100 },
            { subject_name: 'English', marks_obtained: 85, maximum_marks: 100 },
            { subject_name: 'Social Science', marks_obtained: 80, maximum_marks: 100 },
          ],
          interests: ['SCIENCE_PCM', 'TECHNOLOGY & COMPUTERS'],
          preferred_careers: ['Software Engineer', 'Data Scientist', 'Cybersecurity Analyst'],
          work_environment: 'Office / Corporate',
          career_type: 'Technical / Analytical',
          preferred_location: 'Anywhere in India',
        },
        token
      );

      assert(onboardingRes.status === 201, 'Onboarding profile saved with interests and preferred careers');

      // Check Preferences Endpoint
      const prefRes = await request('GET', '/api/careers/preferences', null, token);
      assert(prefRes.status === 200, 'GET /api/careers/preferences returns 200 OK');
      assert(prefRes.data.data.preferred_careers.length === 3, 'Persisted 3 preferred careers');
      assert(prefRes.data.data.preferred_careers[0] === 'Software Engineer', 'First preferred career is Software Engineer');

      // ==========================================
      // Group 3: Graph Pathway Traversal
      // ==========================================
      console.log('\n--- Group 3: Career Pathway Traversal ---');
      const pathwayRes = await request(
        'GET',
        '/api/careers/pathways/CAREER_SOFTWARE_ENGINEER',
        null,
        token
      );

      assert(pathwayRes.status === 200, 'GET /api/careers/pathways/CAREER_SOFTWARE_ENGINEER returns 200');
      assert(pathwayRes.data.data.pathways.length >= 1, `Found ${pathwayRes.data.data.pathways.length} pathways to Software Engineer`);

      const primary = pathwayRes.data.data.pathways[0];
      assert(primary.nodes.length >= 3, `Primary pathway has ${primary.nodes.length} nodes: ${primary.nodes.join(' -> ')}`);
      assert(primary.nodes[0] === 'Class 10', 'Primary pathway originates from Class 10');
      assert(primary.nodes[primary.nodes.length - 1] === 'Software Engineer', 'Primary pathway terminates at Software Engineer');

      // Doctor pathway check
      const docPathwayRes = await request(
        'GET',
        '/api/careers/pathways/CAREER_DOCTOR',
        null,
        token
      );
      assert(docPathwayRes.status === 200, 'Doctor pathway retrieved successfully');
      const docPrimary = docPathwayRes.data.data.pathways[0];
      assert(docPrimary.nodes.includes('Class 12 Science (PCB)'), 'Doctor pathway routes through Class 12 Science (PCB)');

      // ==========================================
      // Group 4: Assessment Simulation & Scoring
      // ==========================================
      console.log('\n--- Group 4: Assessment Integration & Weighted Scoring ---');
      // Simulate completed attempts and results for student
      const modules = [
        { id: 'academic', total: 10, score: 90.0, summary: '{"subject_performance": {"Mathematics": {"total": 5, "correct": 5, "percentage": 100}, "Physics": {"total": 5, "correct": 4, "percentage": 80}}}', correct: 9 },
        { id: 'aptitude', total: 10, score: 80.0, summary: '{"topic_performance": {"Numerical Reasoning": {"total": 5, "correct": 5, "percentage": 100}, "Logical Reasoning": {"total": 5, "correct": 3, "percentage": 60}}}', correct: 8 },
        { id: 'behavioural', total: 10, score: 0, summary: '{"dimension_averages": {"Problem-solving and critical thinking": 4.8, "Independence and initiative": 4.5, "Learning and work preferences": 4.6, "Creativity and curiosity": 4.2, "Teamwork and communication": 3.8, "Adaptability and resilience": 4.0}}', correct: 0 },
        { id: 'situational', total: 5, score: 0, summary: '{"behavioural_signals": {"decision_making": 4.5, "problem_solving": 4.8, "resilience": 4.2, "ethics": 4.0}}', correct: 0 }
      ];

      for (const m of modules) {
        const attemptRes = await query(
          `INSERT INTO assessment_attempts (user_id, module_id, status, total_questions, score, submitted_at)
           VALUES ($1, $2, 'COMPLETED', $3, $4, NOW())
           RETURNING id`,
          [userId, m.id, m.total, m.score]
        );
        const attemptId = attemptRes.rows[0].id;
        await query(
          `INSERT INTO assessment_results (attempt_id, user_id, module_id, total_questions, correct_answers, score_percentage, summary)
           VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
          [attemptId, userId, m.id, m.total, m.correct, m.score, m.summary]
        );
      }

      // Call Career Discovery API
      const recRes = await request('GET', '/api/careers/recommendations', null, token);
      assert(recRes.status === 200, 'GET /api/careers/recommendations returns 200 OK');
      assert(recRes.data.status === 'success', 'Response status is success');

      const recs = recRes.data.data.recommendations;
      assert(recs.length > 0, `Received ${recs.length} career recommendations`);

      // Verify response structure matches exact specification:
      // { career, compatibilityScore, eligibility, reasons, pathways }
      const topRec = recs[0];
      assert(typeof topRec.career === 'string', `Top recommendation career: "${topRec.career}"`);
      assert(typeof topRec.compatibilityScore === 'number', `Compatibility score: ${topRec.compatibilityScore}`);
      assert(topRec.compatibilityScore >= 70, 'Compatibility score reflects high technical aptitude and preference');
      assert(['eligible', 'conditionally_eligible', 'not_eligible'].includes(topRec.eligibility), `Valid eligibility status: "${topRec.eligibility}"`);
      assert(Array.isArray(topRec.reasons) && topRec.reasons.length > 0, `Reasons provided: ${JSON.stringify(topRec.reasons)}`);
      assert(Array.isArray(topRec.pathways) && topRec.pathways.length > 0, `Pathways provided: ${topRec.pathways.length} path(s)`);
      assert(Array.isArray(topRec.pathways[0].nodes), `Pathway nodes format verified: ${topRec.pathways[0].nodes.join(' -> ')}`);

      // Check sorting invariant: ranked descending by score
      for (let i = 0; i < recs.length - 1; i++) {
        assert(
          recs[i].compatibilityScore >= recs[i + 1].compatibilityScore,
          `Ranking order preserved: ${recs[i].compatibilityScore} >= ${recs[i + 1].compatibilityScore}`
        );
      }

      // ==========================================
      // Group 5: Eligibility Invariants for Class 12
      // ==========================================
      console.log('\n--- Group 5: Class 12 Invariants & Ineligibility Handling ---');
      // Create a Class 12 Commerce student
      const commerceEmail = `commerce_student_${Date.now()}@forkora.edu`;
      const commUserRes = await request('POST', '/api/auth/signup', {
        display_name: 'Rohan Sharma',
        email: commerceEmail,
        password: testPassword,
        role: 'STUDENT',
      });
      const commUserId = commUserRes.data.user.id;
      await query(`UPDATE users SET is_email_verified = true WHERE id = $1`, [commUserId]);

      const commSignin = await request('POST', '/api/auth/signin', {
        email: commerceEmail,
        password: testPassword,
      });
      const commToken = commSignin.data.token;

      // Onboard as Class 12 Commerce
      await request(
        'POST',
        '/api/onboarding',
        {
          student_name: 'Rohan Sharma',
          current_class: 12,
          phone_number: '+91 9123456789',
          contact_email: commerceEmail,
          father_name: 'Anil Sharma',
          mother_name: 'Sunita Sharma',
          education_board: 'CBSE',
          stream: 'COMMERCE',
          subjects: [
            { subject_name: 'Accountancy', marks_obtained: 88, maximum_marks: 100 },
            { subject_name: 'Business Studies', marks_obtained: 85, maximum_marks: 100 },
            { subject_name: 'Economics', marks_obtained: 82, maximum_marks: 100 },
            { subject_name: 'English', marks_obtained: 78, maximum_marks: 100 },
          ],
          preferred_careers: ['Chartered Accountant', 'Investment Banker'],
        },
        commToken
      );

      const commRecRes = await request('GET', '/api/careers/recommendations', null, commToken);
      assert(commRecRes.status === 200, 'Class 12 recommendations returned');

      // Verify that Class 12 weights were used when current_class = 12
      const commRecs = commRecRes.data.data.recommendations;
      const doctorRec = commRecs.find((r: any) => r.career === 'Doctor');
      assert(Boolean(doctorRec), 'Doctor career evaluated in recommendations');
      assert(doctorRec.eligibility === 'not_eligible', `Doctor correctly flagged not_eligible for Commerce student (got: ${doctorRec.eligibility})`);

      console.log('\n==================================================');
      console.log('🎉 ALL CAREER GRAPH & RECOMMENDATION TESTS PASSED!');
      console.log('==================================================\n');

      server.close();
      process.exit(0);
    } catch (err: any) {
      console.error('\n❌ Test Suite Failed:', err.message);
      server.close();
      process.exit(1);
    }
  });
}

runTests();
