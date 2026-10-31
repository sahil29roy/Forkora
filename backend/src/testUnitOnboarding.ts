import { onboardingSchema, VALID_BOARDS, VALID_STREAMS } from './validators/onboardingValidator';

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

console.log('🧪 Starting Academic Onboarding Unit Tests...\n');

// 1. Valid Class 10 (Branch A)
console.log('Group 1: Branch A Validation (Class <= 10)');
{
  const result = onboardingSchema.safeParse({
    student_name: 'Ananya Roy',
    current_class: 10,
    phone_number: '+919876543210',
    contact_email: 'ananya@example.com',
    father_name: 'Subhash Roy',
    father_occupation: 'Engineer',
    mother_name: 'Kalyani Roy',
    mother_occupation: 'Doctor',
    education_board: 'CBSE',
    subjects: [
      { subject_name: 'Science', subject_category: 'CORE', marks_obtained: 88, maximum_marks: 100 },
      { subject_name: 'Mathematics', subject_category: 'CORE', marks_obtained: 95, maximum_marks: 100 },
      { subject_name: 'English', subject_category: 'CORE', marks_obtained: 90, maximum_marks: 100 },
      { subject_name: 'Social Science', subject_category: 'CORE', marks_obtained: 85, maximum_marks: 100 },
      { subject_name: 'Computer Applications', subject_category: 'ELECTIVE', marks_obtained: 98, maximum_marks: 100 },
    ],
  });
  assert(result.success, 'Valid Class 10 Branch A payload is accepted without stream');
  if (result.success) {
    assert(result.data.stream === null, 'Stream is normalized to null for Class 10');
    assert(result.data.current_class === 10, 'Class is parsed as 10');
    assert(result.data.subjects.length === 5, 'All 5 subjects are preserved');
  }
}

// 2. Valid Class 12 (Branch B)
console.log('\nGroup 2: Branch B Validation (Class 11 & 12)');
{
  const result = onboardingSchema.safeParse({
    student_name: 'Rohan Sen',
    current_class: 12,
    father_name: 'Amit Sen',
    mother_name: 'Rita Sen',
    education_board: 'ICSE',
    stream: 'SCIENCE',
    subjects: [
      { subject_name: 'Physics', marks_obtained: 92, maximum_marks: 100 },
      { subject_name: 'Chemistry', marks_obtained: 89, maximum_marks: 100 },
      { subject_name: 'Mathematics', marks_obtained: 96, maximum_marks: 100 },
    ],
  });
  assert(result.success, 'Valid Class 12 Science stream payload is accepted');
  if (result.success) {
    assert(result.data.stream === 'SCIENCE', 'Stream is recorded as SCIENCE');
  }
}

// 3. Class 11 missing stream rejected
console.log('\nGroup 3: Conditional Branch Enforcement');
{
  const result = onboardingSchema.safeParse({
    student_name: 'Rohan Sen',
    current_class: 11,
    father_name: 'Amit Sen',
    mother_name: 'Rita Sen',
    education_board: 'STATE',
    stream: null, // missing stream for class 11
    subjects: [{ subject_name: 'Physics', marks_obtained: 80, maximum_marks: 100 }],
  });
  assert(!result.success, 'Class 11 without stream is rejected');
  if (!result.success) {
    const streamErrors = result.error.flatten().fieldErrors.stream;
    assert(
      Boolean(streamErrors && streamErrors.length > 0),
      'Returns specific error issue on "stream" field'
    );
  }
}

// 4. Father / Mother Validation
console.log('\nGroup 4: Parent (Father & Mother) Invariants');
{
  const missingFather = onboardingSchema.safeParse({
    student_name: 'Priya',
    current_class: 8,
    mother_name: 'Sunita',
    education_board: 'CBSE',
    subjects: [{ subject_name: 'Math', marks_obtained: 75, maximum_marks: 100 }],
  });
  assert(!missingFather.success, 'Payload missing father_name is rejected');

  const missingMother = onboardingSchema.safeParse({
    student_name: 'Priya',
    current_class: 8,
    father_name: 'Rajesh',
    education_board: 'CBSE',
    subjects: [{ subject_name: 'Math', marks_obtained: 75, maximum_marks: 100 }],
  });
  assert(!missingMother.success, 'Payload missing mother_name is rejected');
}

// 5. Marks Validation
console.log('\nGroup 5: Subject Marks Validation Rules');
{
  const exceedMarks = onboardingSchema.safeParse({
    student_name: 'Priya',
    current_class: 9,
    father_name: 'Rajesh',
    mother_name: 'Sunita',
    education_board: 'CBSE',
    subjects: [{ subject_name: 'Math', marks_obtained: 105, maximum_marks: 100 }],
  });
  assert(!exceedMarks.success, 'Marks obtained (105) > maximum marks (100) is rejected');

  const negativeMarks = onboardingSchema.safeParse({
    student_name: 'Priya',
    current_class: 9,
    father_name: 'Rajesh',
    mother_name: 'Sunita',
    education_board: 'CBSE',
    subjects: [{ subject_name: 'Math', marks_obtained: -5, maximum_marks: 100 }],
  });
  assert(!negativeMarks.success, 'Negative marks obtained (-5) is rejected');

  const zeroMaxMarks = onboardingSchema.safeParse({
    student_name: 'Priya',
    current_class: 9,
    father_name: 'Rajesh',
    mother_name: 'Sunita',
    education_board: 'CBSE',
    subjects: [{ subject_name: 'Math', marks_obtained: 0, maximum_marks: 0 }],
  });
  assert(!zeroMaxMarks.success, 'Maximum marks of 0 is rejected (must be positive)');
}

// 6. Flexible Nested & CamelCase Structure Support
console.log('\nGroup 6: Input Normalization (Nested, CamelCase, and String Phones)');
{
  const nestedResult = onboardingSchema.safeParse({
    studentDetails: {
      studentName: 'Vivaan Kapoor',
      currentClass: 11,
      phoneNumber: '+91 9988776655',
      contactEmail: 'vivaan@gmail.com',
    },
    parentDetails: {
      fatherName: 'Deepak Kapoor',
      fatherOccupation: 'Film Director',
      motherName: 'Neetu Kapoor',
      motherOccupation: 'Costume Designer',
    },
    academicDetails: {
      educationBoard: 'IB',
      stream: 'HUMANITIES',
      subjects: [
        { subjectName: 'World History', subjectCategory: 'CORE', marksObtained: 95, maximumMarks: 100 },
        { subjectName: 'Psychology', subjectCategory: 'CORE', marksObtained: 90, maximumMarks: 100 },
      ],
    },
  });
  assert(nestedResult.success, 'Nested camelCase structure (studentDetails, parentDetails, academicDetails) is accepted');
  if (nestedResult.success) {
    assert(nestedResult.data.student_name === 'Vivaan Kapoor', 'student_name extracted properly');
    assert(nestedResult.data.father_name === 'Deepak Kapoor', 'father_name extracted properly');
    assert(nestedResult.data.mother_name === 'Neetu Kapoor', 'mother_name extracted properly');
    assert(nestedResult.data.stream === 'HUMANITIES', 'stream extracted properly');
    assert(nestedResult.data.phone_number === '+91 9988776655', 'phone_number preserved with country code');
  }
}

// 7. Catalog Constants
console.log('\nGroup 7: Academic Catalog Constants');
{
  assert(VALID_BOARDS.includes('CBSE'), 'VALID_BOARDS includes CBSE');
  assert(VALID_BOARDS.includes('ICSE'), 'VALID_BOARDS includes ICSE');
  assert(VALID_STREAMS.includes('SCIENCE'), 'VALID_STREAMS includes SCIENCE');
  assert(VALID_STREAMS.includes('COMMERCE'), 'VALID_STREAMS includes COMMERCE');
  assert(VALID_STREAMS.includes('HUMANITIES'), 'VALID_STREAMS includes HUMANITIES');
  assert(VALID_STREAMS.includes('VOCATIONAL'), 'VALID_STREAMS includes VOCATIONAL');
}

console.log(`\n========================================`);
console.log(`Unit Test Summary: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log(`========================================\n`);

if (failedCount > 0) {
  process.exit(1);
}
