import { z } from 'zod';
import { OnboardingData, SubjectInput } from '../types';

export const VALID_STREAMS = ['SCIENCE', 'COMMERCE', 'HUMANITIES', 'VOCATIONAL', 'OTHER'] as const;
export const VALID_BOARDS = ['CBSE', 'ICSE', 'STATE', 'IB', 'IGCSE', 'OTHER'] as const;
export const VALID_CATEGORIES = ['CORE', 'ELECTIVE', 'ADDITIONAL', 'OTHER'] as const;

// Single subject schema
const subjectSchema = z.object({
  subject_name: z
    .string({ message: 'Subject name is required' })
    .trim()
    .min(1, 'Subject name cannot be empty'),
  subject_category: z
    .enum(['CORE', 'ELECTIVE', 'ADDITIONAL', 'OTHER'])
    .default('CORE')
    .optional(),
  marks_obtained: z
    .number({ message: 'Marks obtained is required' })
    .min(0, 'Marks obtained must be 0 or greater'),
  maximum_marks: z
    .number({ message: 'Maximum marks is required' })
    .positive('Maximum marks must be greater than 0'),
  grade: z.string().trim().optional().nullable(),
}).refine((data) => data.marks_obtained <= data.maximum_marks, {
  message: 'Marks obtained cannot exceed maximum marks',
  path: ['marks_obtained'],
});

// Normalized raw schema to parse flat or nested inputs
export const onboardingSchema = z.preprocess((val: any) => {
  if (!val || typeof val !== 'object') return val;

  // Flatten nested structure if provided (Section A, B, C)
  const student = val.studentDetails || val.student_details || {};
  const parent = val.parentDetails || val.parent_details || {};
  const academic = val.academicDetails || val.academic_details || {};

  // Extract student details
  const student_name = val.student_name ?? val.studentName ?? student.student_name ?? student.studentName;
  const current_class = val.current_class ?? val.currentClass ?? student.current_class ?? student.currentClass;
  const phone_number = val.phone_number ?? val.phoneNumber ?? student.phone_number ?? student.phoneNumber;
  const contact_email = val.contact_email ?? val.contactEmail ?? student.contact_email ?? student.contactEmail;

  // Extract parent / father & mother details (supporting father/mother as requested, with parent 1/2 fallback)
  const father_name = val.father_name ?? val.fatherName ?? parent.father_name ?? parent.fatherName ?? val.parent_1_name ?? val.parent1Name ?? parent.parent_1_name ?? parent.parent1Name;
  const father_occupation = val.father_occupation ?? val.fatherOccupation ?? parent.father_occupation ?? parent.fatherOccupation ?? val.parent_1_occupation ?? val.parent1Occupation ?? parent.parent_1_occupation ?? parent.parent1Occupation;
  const mother_name = val.mother_name ?? val.motherName ?? parent.mother_name ?? parent.motherName ?? val.parent_2_name ?? val.parent2Name ?? parent.parent_2_name ?? parent.parent2Name;
  const mother_occupation = val.mother_occupation ?? val.motherOccupation ?? parent.mother_occupation ?? parent.motherOccupation ?? val.parent_2_occupation ?? val.parent2Occupation ?? parent.parent_2_occupation ?? parent.parent2Occupation;

  // Extract academic details
  const education_board = val.education_board ?? val.educationBoard ?? academic.education_board ?? academic.educationBoard;
  const raw_stream = val.stream ?? academic.stream;
  const stream = typeof raw_stream === 'string' ? raw_stream.trim().toUpperCase() : raw_stream;

  // Extract and normalize subjects
  const rawSubjects = val.subjects ?? academic.subjects ?? [];
  const subjects = Array.isArray(rawSubjects)
    ? rawSubjects.map((s: any) => ({
        subject_name: s.subject_name ?? s.subjectName ?? '',
        subject_category: (s.subject_category ?? s.subjectCategory ?? 'CORE').toUpperCase(),
        marks_obtained: Number(s.marks_obtained ?? s.marksObtained ?? 0),
        maximum_marks: Number(s.maximum_marks ?? s.maximumMarks ?? 100),
        grade: s.grade ?? null,
      }))
    : rawSubjects;

  return {
    student_name,
    current_class: Number(current_class),
    phone_number: phone_number ? String(phone_number).trim() : null,
    contact_email: contact_email ? String(contact_email).trim() : null,
    father_name,
    father_occupation: father_occupation ? String(father_occupation).trim() : null,
    mother_name,
    mother_occupation: mother_occupation ? String(mother_occupation).trim() : null,
    education_board,
    stream: stream || null,
    subjects,
    interests: Array.isArray(val.interests ?? val.areas_of_interest ?? val.areasOfInterest ?? academic.interests)
      ? (val.interests ?? val.areas_of_interest ?? val.areasOfInterest ?? academic.interests)
      : [],
    preferred_careers: Array.isArray(val.preferred_careers ?? val.preferredCareers ?? val.career_preferences?.preferred_careers ?? val.careerPreferences?.preferredCareers)
      ? (val.preferred_careers ?? val.preferredCareers ?? val.career_preferences?.preferred_careers ?? val.careerPreferences?.preferredCareers)
      : [],
    work_environment: String(val.work_environment ?? val.workEnvironment ?? val.career_preferences?.workEnvironment ?? val.careerPreferences?.workEnvironment ?? 'No preference'),
    career_type: String(val.career_type ?? val.careerType ?? val.career_preferences?.careerType ?? val.careerPreferences?.careerType ?? 'No preference'),
    preferred_location: String(val.preferred_location ?? val.preferredLocation ?? val.career_preferences?.preferredLocation ?? val.careerPreferences?.preferredLocation ?? 'No preference'),
  };
}, z.object({
  student_name: z
    .string({ message: 'Student name is required' })
    .trim()
    .min(1, 'Student name must not be empty'),
  current_class: z
    .number({ message: 'Current class is required' })
    .int('Current class must be an integer')
    .min(1, 'Current class must be between 1 and 12')
    .max(12, 'Current class must be between 1 and 12'),
  phone_number: z
    .string()
    .trim()
    .min(5, 'Phone number must be at least 5 characters')
    .optional()
    .nullable(),
  contact_email: z
    .string()
    .trim()
    .email('Invalid contact email format')
    .optional()
    .nullable()
    .or(z.literal('')),
  father_name: z
    .string({ message: "Father's name is required" })
    .trim()
    .min(1, "Father's name must not be empty"),
  father_occupation: z.string().trim().optional().nullable(),
  mother_name: z
    .string({ message: "Mother's name is required" })
    .trim()
    .min(1, "Mother's name must not be empty"),
  mother_occupation: z.string().trim().optional().nullable(),
  education_board: z
    .string({ message: 'Education board is required' })
    .trim()
    .min(1, 'Education board must not be empty'),
  stream: z.string().trim().optional().nullable(),
  subjects: z
    .array(subjectSchema, { message: 'Subjects array is required' })
    .min(1, 'At least one subject must be provided'),
  interests: z.array(z.string()).optional().default([]),
  preferred_careers: z.array(z.string()).optional().default([]),
  work_environment: z.string().optional().default('No preference'),
  career_type: z.string().optional().default('No preference'),
  preferred_location: z.string().optional().default('No preference'),
}).superRefine((data, ctx) => {
  // Conditional Branch Logic:
  // Branch B: Class 11 or 12 requires stream
  if (data.current_class >= 11) {
    if (!data.stream || data.stream.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['stream'],
        message: 'Stream is required for Class 11 and 12 (e.g. SCIENCE, COMMERCE, HUMANITIES, VOCATIONAL, OTHER)',
      });
    }
  }
  // For Class <= 10, stream is not required and will be set to null if not provided
}));

export type ValidatedOnboardingInput = z.infer<typeof onboardingSchema>;

// Stage 1 Schema: Student and Parent/Guardian Details
export const stage1Schema = z.preprocess((val: any) => {
  if (!val || typeof val !== 'object') return val;

  const student = val.studentDetails || val.student_details || {};
  const parent = val.parentDetails || val.parent_details || val.familyDetails || val.family_details || {};
  const parent1 = parent.parent1 || parent.parent_1 || {};
  const parent2 = parent.parent2 || parent.parent_2 || {};

  const student_name = val.student_name ?? val.studentName ?? student.student_name ?? student.studentName;
  const current_class = val.current_class ?? val.currentClass ?? student.current_class ?? student.currentClass;
  const phone_number = val.phone_number ?? val.phoneNumber ?? student.phone_number ?? student.phoneNumber;
  const contact_email = val.contact_email ?? val.contactEmail ?? student.contact_email ?? student.contactEmail;

  const parent_1_name = val.parent_1_name ?? val.parent1Name ?? parent.parent_1_name ?? parent.parent1Name ?? parent1.name ?? val.father_name ?? val.fatherName ?? parent.father_name ?? parent.fatherName;
  const parent_1_occupation = val.parent_1_occupation ?? val.parent1Occupation ?? parent.parent_1_occupation ?? parent.parent1Occupation ?? parent1.occupation ?? val.father_occupation ?? val.fatherOccupation ?? parent.father_occupation ?? parent.fatherOccupation;

  const parent_2_name = val.parent_2_name ?? val.parent2Name ?? parent.parent_2_name ?? parent.parent2Name ?? parent2.name ?? val.mother_name ?? val.motherName ?? parent.mother_name ?? parent.motherName;
  const parent_2_occupation = val.parent_2_occupation ?? val.parent2Occupation ?? parent.parent_2_occupation ?? parent.parent2Occupation ?? parent2.occupation ?? val.mother_occupation ?? val.motherOccupation ?? parent.mother_occupation ?? parent.motherOccupation;

  return {
    student_name,
    current_class: Number(current_class),
    phone_number: phone_number ? String(phone_number).trim() : null,
    contact_email: contact_email ? String(contact_email).trim() : null,
    parent_1_name,
    parent_1_occupation: parent_1_occupation ? String(parent_1_occupation).trim() : null,
    parent_2_name,
    parent_2_occupation: parent_2_occupation ? String(parent_2_occupation).trim() : null,
  };
}, z.object({
  student_name: z
    .string({ message: 'Student name is required' })
    .trim()
    .min(2, 'Student name must be at least 2 characters'),
  current_class: z
    .number({ message: 'Current class is required' })
    .int('Current class must be an integer')
    .min(1, 'Current class must be between 1 and 12')
    .max(12, 'Current class must be between 1 and 12'),
  phone_number: z
    .string()
    .trim()
    .min(5, 'Phone number must be at least 5 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  contact_email: z
    .string()
    .trim()
    .email('Invalid contact email format')
    .optional()
    .nullable()
    .or(z.literal('')),
  parent_1_name: z
    .string({ message: 'Parent 1 name is required' })
    .trim()
    .min(2, 'Parent 1 name must be at least 2 characters'),
  parent_1_occupation: z.string().trim().optional().nullable().or(z.literal('')),
  parent_2_name: z
    .string({ message: 'Parent 2 name is required' })
    .trim()
    .min(2, 'Parent 2 name must be at least 2 characters'),
  parent_2_occupation: z.string().trim().optional().nullable().or(z.literal('')),
}));

export type ValidatedStage1Input = z.infer<typeof stage1Schema>;

