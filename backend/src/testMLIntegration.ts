import http from 'http';
import app from './app';
import { query } from './config/db';
import { seedCareerGraph } from './db/seedCareerGraph';
import {
  buildPredictionPayload,
  invokePythonPredictor,
  getOrComputeMLPredictions,
} from './services/mlPredictionService';
import { StudentAssessmentContext } from './services/careerScoringService';

const TEST_PORT = 5012;

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

async function runMLIntegrationTests(): Promise<void> {
  console.log('🧪 Starting Forkora ML Model Backend Integration Tests...\n');

  // ==========================================
  // Group 1: Payload Construction Unit Tests
  // ==========================================
  console.log('--- Group 1: Payload Transformation Tests ---');
  const dummyContext: StudentAssessmentContext = {
    userId: 999,
    currentClass: 12,
    stream: 'SCIENCE_PCM',
    interests: ['TECHNOLOGY & COMPUTERS'],
    preferredCareers: ['Software Engineer'],
    workEnvironment: 'Corporate',
    careerType: 'Technical',
    preferredLocation: 'India',
    mlPredictions: {},
    enrolledSubjects: [
      { subject_name: 'Physics', marks_obtained: 88, maximum_marks: 100 },
      { subject_name: 'Chemistry', marks_obtained: 84, maximum_marks: 100 },
      { subject_name: 'Mathematics', marks_obtained: 94, maximum_marks: 100 },
      { subject_name: 'English', marks_obtained: 82, maximum_marks: 100 },
      { subject_name: 'Computer Science', marks_obtained: 98, maximum_marks: 100 },
    ],
  };

  const payload = buildPredictionPayload(dummyContext);
  assert(payload['Class12_Stream'] === 'PCM', 'Stream mapped to canonical "PCM"');
  assert(payload['Class12_Subject1_Name'] === 'Physics', 'Subject 1 mapped to Physics');
  assert(payload['Class12_Subject1_Marks'] === 88, 'Subject 1 mark mapped to 88');
  assert(payload['Class12_Subject3_Name'] === 'Mathematics', 'Subject 3 mapped to Mathematics');
  assert(payload['Class12_Subject3_Marks'] === 94, 'Subject 3 mark mapped to 94');
  assert(payload['Class12_Percentage'] === 89.2, 'Aggregate percentage computed accurately (89.2)');

  // ==========================================
  // Group 2: Python Model Execution Test
  // ==========================================
  console.log('\n--- Group 2: Python ML Predictor Subprocess Test ---');
  const mlOutput = await invokePythonPredictor(payload, 10000);
  assert(mlOutput !== null, 'Python ML predictor executed and returned response');
  if (mlOutput) {
    assert(mlOutput.model_version === 'v1', `Model version verified: ${mlOutput.model_version}`);
    assert(typeof mlOutput.predicted_career === 'string', `Predicted career: ${mlOutput.predicted_career}`);
    assert(Array.isArray(mlOutput.top_predictions) && mlOutput.top_predictions.length === 3, 'Top 3 predictions returned with probabilities');
    assert(mlOutput.top_predictions[0].probability >= mlOutput.top_predictions[1].probability, 'Top predictions sorted descending by probability');
    assert(Boolean(mlOutput.career_node_scores), 'Career node scores dictionary populated');
    assert(typeof mlOutput.career_node_scores['CAREER_SOFTWARE_ENGINEER'] === 'number', `Software Engineer score: ${mlOutput.career_node_scores['CAREER_SOFTWARE_ENGINEER']}`);
    assert(mlOutput.career_node_scores['CAREER_SOFTWARE_ENGINEER'] >= 75, 'Technical profile scored >= 75 for Software Engineer');
  }

  // ==========================================
  // Group 3: HTTP API & End-to-End Recommendations Test
  // ==========================================
  console.log('\n--- Group 3: HTTP API End-to-End Recommendations Test ---');
  const server = app.listen(TEST_PORT, async () => {
    try {
      await seedCareerGraph();

      // Register test student
      const testEmail = `ml_tester_${Date.now()}@forkora.edu`;
      const testPassword = 'Password123!';
      const signupRes = await request('POST', '/api/auth/signup', {
        display_name: 'Jordan Lee',
        email: testEmail,
        password: testPassword,
        role: 'STUDENT',
      });
      assert(signupRes.status === 201, 'Student signed up');
      const userId = signupRes.data.user.id;
      await query(`UPDATE users SET is_email_verified = true WHERE id = $1`, [userId]);

      const signinRes = await request('POST', '/api/auth/signin', {
        email: testEmail,
        password: testPassword,
      });
      const token = signinRes.data.token;

      // Onboard student with Class 12 Science PCM profile
      const onboardRes = await request(
        'POST',
        '/api/onboarding',
        {
          student_name: 'Jordan Lee',
          current_class: 12,
          stream: 'SCIENCE_PCM',
          phone_number: '+91 9123456789',
          contact_email: testEmail,
          father_name: 'Marcus Lee',
          father_occupation: 'Civil Engineer',
          mother_name: 'Grace Lee',
          mother_occupation: 'Teacher',
          education_board: 'CBSE',
          subjects: [
            { subject_name: 'Physics', marks_obtained: 88, maximum_marks: 100 },
            { subject_name: 'Chemistry', marks_obtained: 84, maximum_marks: 100 },
            { subject_name: 'Mathematics', marks_obtained: 94, maximum_marks: 100 },
            { subject_name: 'English', marks_obtained: 82, maximum_marks: 100 },
            { subject_name: 'Computer Science', marks_obtained: 98, maximum_marks: 100 },
          ],
          interests: ['SCIENCE_PCM', 'TECHNOLOGY & COMPUTERS'],
          preferred_careers: ['Software Engineer', 'Data Scientist'],
          work_environment: 'Office / Corporate',
          career_type: 'Technical / Analytical',
          preferred_location: 'Anywhere in India',
        },
        token
      );
      assert(onboardRes.status === 201, 'Student onboarding completed with PCM subjects');

      // Test GET /api/careers/ml-predictions endpoint
      console.log('\nTesting GET /api/careers/ml-predictions...');
      const mlApiRes = await request('GET', '/api/careers/ml-predictions', null, token);
      assert(mlApiRes.status === 200, 'GET /api/careers/ml-predictions returns 200 OK');
      assert(mlApiRes.data.status === 'success', 'ML API response status is success');
      assert(mlApiRes.data.data.model_version === 'v1', `ML API returns model version v1`);
      assert(Boolean(mlApiRes.data.data.career_node_scores.CAREER_SOFTWARE_ENGINEER), 'ML API returns node score for Software Engineer');

      // Test GET /api/careers/recommendations (Weighted scoring with live ML model)
      console.log('\nTesting GET /api/careers/recommendations with live ML scoring...');
      const recRes = await request('GET', '/api/careers/recommendations', null, token);
      assert(recRes.status === 200, 'GET /api/careers/recommendations returns 200 OK');
      assert(recRes.data.data.recommendations.length > 0, 'Recommendations calculated');

      const topRec = recRes.data.data.recommendations[0];
      assert(['Software Engineer', 'Data Scientist'].includes(topRec.career), `Top recommended career is technical ("${topRec.career}")`);
      assert(topRec.breakdown.ml_score >= 70, `Breakdown ml_score is derived from ML model (${topRec.breakdown.ml_score})`);
      assert(topRec.breakdown.weights.ml === 0.30, `ML weight for Class 12 correctly applied (30%)`);
      assert(topRec.reasons.length > 0, `Explanations generated: ${JSON.stringify(topRec.reasons)}`);

      console.log('\n==================================================');
      console.log('🎉 ALL ML INTEGRATION TESTS PASSED SUCCESSFULLY!');
      console.log('==================================================\n');

      server.close(() => process.exit(0));
    } catch (err: any) {
      console.error('❌ Test failed with error:', err);
      server.close(() => process.exit(1));
    }
  });
}

runMLIntegrationTests();
