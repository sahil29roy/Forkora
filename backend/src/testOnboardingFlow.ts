import http from 'http';
import app from './app';
import { query } from './config/db';

const PORT = 5011;

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

// Helper to create and verify a fresh user and get JWT
async function createVerifiedUser(prefix: string): Promise<{ token: string; email: string; id: number }> {
  const email = `${prefix}_${Date.now()}@forkora.edu`;
  const password = 'Password123!';

  // 1. Signup
  const signupRes = await request('POST', '/api/auth/signup', {
    display_name: 'Test Student',
    email,
    password,
    role: 'STUDENT',
  });
  if (signupRes.status !== 201) {
    throw new Error(`Signup failed: ${JSON.stringify(signupRes.data)}`);
  }

  // 2. Fetch OTP from DB
  const otpRes = await query(
    `SELECT ev.code FROM email_verifications ev JOIN users u ON ev.user_id = u.id WHERE u.email = $1 ORDER BY ev.created_at DESC LIMIT 1`,
    [email]
  );
  const otp = otpRes.rows[0].code;

  // 3. Verify Email
  const verifyRes = await request('POST', '/api/auth/verify-email', {
    email,
    code: otp,
  });
  if (verifyRes.status !== 200) {
    throw new Error(`Verify failed: ${JSON.stringify(verifyRes.data)}`);
  }

  return {
    token: verifyRes.data.token,
    email,
    id: verifyRes.data.user.id,
  };
}

async function runOnboardingTests(): Promise<void> {
  const server = app.listen(PORT, async () => {
    console.log(`\n🧪 Testing Academic Onboarding Module on port ${PORT}...\n`);

    try {
      // 1. TEST ACADEMIC CATALOG ENDPOINT (Public)
      console.log('1️⃣ Testing GET /api/onboarding/catalog...');
      const catalogRes = await request('GET', '/api/onboarding/catalog');
      console.log('   Status:', catalogRes.status);
      if (catalogRes.status !== 200 || !catalogRes.data.data.branches) {
        throw new Error('Catalog endpoint failed!');
      }
      console.log('   ✓ Catalog returned boards, streams, Branch A and Branch B catalogs.');

      // 2. CREATE A VERIFIED STUDENT USER
      console.log('\n2️⃣ Creating and authenticating student test user...');
      const student1 = await createVerifiedUser('student10');
      console.log(`   ✓ User created (ID: ${student1.id}, Email: ${student1.email})`);

      // 3. CHECK ONBOARDING STATUS BEFORE SUBMISSION
      console.log('\n3️⃣ Checking initial onboarding status GET /api/onboarding...');
      const initialStatusRes = await request('GET', '/api/onboarding', null, student1.token);
      console.log('   Status:', initialStatusRes.status);
      console.log('   is_completed:', initialStatusRes.data.is_completed);
      if (initialStatusRes.data.is_completed !== false) {
        throw new Error('Expected is_completed to be false before onboarding.');
      }

      // 4. TEST ZOD CONDITIONAL VALIDATION FAILURES
      console.log('\n4️⃣ Testing Zod validation edge cases & conditional rules...');

      // 4a. Missing Father's Name
      console.log('   -> Testing missing father_name...');
      const failFatherRes = await request(
        'POST',
        '/api/onboarding',
        {
          student_name: 'Aarav Sharma',
          current_class: 10,
          mother_name: 'Pooja Sharma',
          education_board: 'CBSE',
          subjects: [{ subject_name: 'Science', marks_obtained: 85, maximum_marks: 100 }],
        },
        student1.token
      );
      if (failFatherRes.status !== 400) {
        throw new Error('Expected 400 Bad Request for missing father_name');
      }
      console.log('      ✓ Successfully rejected missing father_name with 400.');

      // 4b. Marks obtained greater than maximum marks
      console.log('   -> Testing marks_obtained > maximum_marks...');
      const failMarksRes = await request(
        'POST',
        '/api/onboarding',
        {
          student_name: 'Aarav Sharma',
          current_class: 10,
          father_name: 'Ramesh Sharma',
          mother_name: 'Pooja Sharma',
          education_board: 'CBSE',
          subjects: [{ subject_name: 'Mathematics', marks_obtained: 105, maximum_marks: 100 }],
        },
        student1.token
      );
      if (failMarksRes.status !== 400) {
        throw new Error('Expected 400 Bad Request for marks_obtained > maximum_marks');
      }
      console.log('      ✓ Successfully rejected invalid marks with 400.');

      // 4c. Class 11 missing stream (Conditional routing rule)
      console.log('   -> Testing Class 11 without stream (Branch B constraint)...');
      const failStreamRes = await request(
        'POST',
        '/api/onboarding',
        {
          student_name: 'Aarav Sharma',
          current_class: 11,
          father_name: 'Ramesh Sharma',
          mother_name: 'Pooja Sharma',
          education_board: 'CBSE',
          stream: null, // missing stream for class 11
          subjects: [{ subject_name: 'Physics', marks_obtained: 85, maximum_marks: 100 }],
        },
        student1.token
      );
      if (failStreamRes.status !== 400) {
        throw new Error('Expected 400 Bad Request for Class 11 missing stream');
      }
      console.log('      ✓ Successfully enforced stream requirement for Class 11.');

      // 5. TEST BRANCH A ONBOARDING (Class 10 or below)
      console.log('\n5️⃣ Testing Branch A Onboarding (Class 10 Student: Common subjects + electives)...');
      const branchAPayload = {
        studentDetails: {
          studentName: 'Aarav Sharma',
          currentClass: 10,
          phoneNumber: '+919876543210',
          contactEmail: 'aarav.personal@example.com',
        },
        parentDetails: {
          fatherName: 'Ramesh Sharma',
          fatherOccupation: 'Architect',
          motherName: 'Pooja Sharma',
          motherOccupation: 'Professor',
        },
        academicDetails: {
          educationBoard: 'CBSE',
          subjects: [
            { subjectName: 'Science', subjectCategory: 'CORE', marksObtained: 88, maximumMarks: 100 },
            { subjectName: 'Mathematics', subjectCategory: 'CORE', marksObtained: 94, maximumMarks: 100 },
            { subjectName: 'Social Science', subjectCategory: 'CORE', marksObtained: 85, maximumMarks: 100 },
            { subjectName: 'English', subjectCategory: 'CORE', marksObtained: 90, maximumMarks: 100 },
            { subjectName: 'Hindi', subjectCategory: 'ELECTIVE', marksObtained: 82, maximumMarks: 100 },
            { subjectName: 'Computer Science', subjectCategory: 'ELECTIVE', marksObtained: 96, maximumMarks: 100 },
          ],
        },
      };

      const branchARes = await request('POST', '/api/onboarding', branchAPayload, student1.token);
      console.log('   Status:', branchARes.status);
      console.log('   Message:', branchARes.data.message);
      if (branchARes.status !== 201) {
        throw new Error(`Branch A onboarding failed: ${JSON.stringify(branchARes.data)}`);
      }

      const savedStudent = branchARes.data.data.studentProfile;
      const savedAcademic = branchARes.data.data.academicRecord;
      if (savedStudent.student_name !== 'Aarav Sharma' || savedStudent.current_class !== 10) {
        throw new Error('Student profile data mismatch');
      }
      if (savedStudent.father_name !== 'Ramesh Sharma' || savedStudent.mother_name !== 'Pooja Sharma') {
        throw new Error('Parent data mismatch');
      }
      if (savedAcademic.subjects.length !== 6) {
        throw new Error(`Expected 6 subjects, got ${savedAcademic.subjects.length}`);
      }
      console.log('   ✓ Branch A profile and 6 subjects saved successfully!');

      // 6. RETRIEVE SAVED ONBOARDING PROFILE GET /api/onboarding
      console.log('\n6️⃣ Testing retrieval of completed profile GET /api/onboarding...');
      const getProfileRes = await request('GET', '/api/onboarding', null, student1.token);
      console.log('   Status:', getProfileRes.status);
      console.log('   is_completed:', getProfileRes.data.is_completed);
      if (!getProfileRes.data.is_completed) {
        throw new Error('Expected profile to be marked completed.');
      }
      const retrieved = getProfileRes.data.data;
      console.log(`   Retrieved: ${retrieved.studentProfile.student_name}, Class ${retrieved.studentProfile.current_class}`);
      console.log(`   Parents: Father - ${retrieved.studentProfile.father_name} (${retrieved.studentProfile.father_occupation}), Mother - ${retrieved.studentProfile.mother_name} (${retrieved.studentProfile.mother_occupation})`);
      console.log(`   Family Profiles records count: ${retrieved.familyProfiles.length}`);
      console.log(`   Academic Record: Board ${retrieved.academicRecord.education_board}, Subjects count: ${retrieved.academicRecord.subjects.length}`);
      if (retrieved.familyProfiles.length !== 2) {
        throw new Error('Expected 2 family profile records (Father & Mother)');
      }
      console.log('   ✓ Complete profile structure retrieved correctly.');

      // 7. EDIT PARENT DETAILS PUT /api/onboarding/parents
      console.log('\n7️⃣ Testing editing parent details PUT /api/onboarding/parents...');
      const editParentsRes = await request(
        'PUT',
        '/api/onboarding/parents',
        {
          father_name: 'Ramesh Sharma',
          father_occupation: 'Senior Principal Architect',
          mother_name: 'Dr. Pooja Sharma',
          mother_occupation: 'Dean of Engineering',
        },
        student1.token
      );
      console.log('   Status:', editParentsRes.status);
      console.log('   Message:', editParentsRes.data.message);
      if (editParentsRes.status !== 200) {
        throw new Error(`Edit parents failed: ${JSON.stringify(editParentsRes.data)}`);
      }
      const updatedStudent = editParentsRes.data.data.studentProfile;
      if (
        updatedStudent.father_occupation !== 'Senior Principal Architect' ||
        updatedStudent.mother_name !== 'Dr. Pooja Sharma'
      ) {
        throw new Error('Updated parent details did not persist correctly.');
      }
      console.log('   ✓ Parent details updated independently and successfully.');

      // 8. TEST BRANCH B ONBOARDING (Class 12 Student: Stream + Flexible Subjects)
      console.log('\n8️⃣ Testing Branch B Onboarding (Class 12 Student: Stream + Flexible Subjects)...');
      const student2 = await createVerifiedUser('student12');

      const branchBPayload = {
        student_name: 'Ishaan Verma',
        current_class: 12,
        phone_number: '+919811223344',
        contact_email: 'ishaan.verma@example.com',
        father_name: 'Vikram Verma',
        father_occupation: 'Chartered Accountant',
        mother_name: 'Anita Verma',
        mother_occupation: 'Entrepreneur',
        education_board: 'CBSE',
        stream: 'SCIENCE',
        subjects: [
          { subject_name: 'Physics', subject_category: 'CORE', marks_obtained: 92, maximum_marks: 100 },
          { subject_name: 'Chemistry', subject_category: 'CORE', marks_obtained: 89, maximum_marks: 100 },
          { subject_name: 'Mathematics', subject_category: 'CORE', marks_obtained: 95, maximum_marks: 100 },
          { subject_name: 'Computer Science', subject_category: 'ELECTIVE', marks_obtained: 98, maximum_marks: 100 },
          { subject_name: 'English', subject_category: 'CORE', marks_obtained: 91, maximum_marks: 100 },
        ],
      };

      const branchBRes = await request('POST', '/api/onboarding', branchBPayload, student2.token);
      console.log('   Status:', branchBRes.status);
      console.log('   Message:', branchBRes.data.message);
      if (branchBRes.status !== 201) {
        throw new Error(`Branch B onboarding failed: ${JSON.stringify(branchBRes.data)}`);
      }

      const branchBRecord = branchBRes.data.data.academicRecord;
      if (branchBRecord.stream !== 'SCIENCE' || branchBRecord.class_level !== 12) {
        throw new Error('Branch B stream or class_level mismatch.');
      }
      console.log(`   ✓ Class 12 Science stream onboarding verified with ${branchBRecord.subjects.length} subjects.`);

      // 9. TEST BRANCH B COMMERCE STREAM (Flexible combination)
      console.log('\n9️⃣ Testing Branch B Commerce Stream...');
      const student3 = await createVerifiedUser('student_commerce');
      const commercePayload = {
        student_name: 'Sneha Patel',
        current_class: 11,
        father_name: 'Dinesh Patel',
        mother_name: 'Meena Patel',
        education_board: 'ICSE',
        stream: 'COMMERCE',
        subjects: [
          { subject_name: 'Accountancy', subject_category: 'CORE', marks_obtained: 87, maximum_marks: 100 },
          { subject_name: 'Business Studies', subject_category: 'CORE', marks_obtained: 90, maximum_marks: 100 },
          { subject_name: 'Economics', subject_category: 'CORE', marks_obtained: 85, maximum_marks: 100 },
          { subject_name: 'Mathematics', subject_category: 'CORE', marks_obtained: 92, maximum_marks: 100 },
          { subject_name: 'English', subject_category: 'CORE', marks_obtained: 88, maximum_marks: 100 },
        ],
      };

      const commerceRes = await request('POST', '/api/onboarding', commercePayload, student3.token);
      if (commerceRes.status !== 201 || commerceRes.data.data.academicRecord.stream !== 'COMMERCE') {
        throw new Error('Commerce stream onboarding failed.');
      }
      console.log('   ✓ Class 11 Commerce stream onboarding verified successfully.');

      console.log('\n🎉 ALL ACADEMIC ONBOARDING TESTS PASSED FLAWLESSLY!\n');
    } catch (err: any) {
      console.error('\n❌ Test Suite Failed:', err.message);
      process.exitCode = 1;
    } finally {
      server.close();
      process.exit(process.exitCode || 0);
    }
  });
}

runOnboardingTests().catch((err) => {
  console.error('Test startup failed:', err);
  process.exit(1);
});
