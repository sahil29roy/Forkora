import { Request } from 'express';

export type UserRole = 'STUDENT' | 'GUARDIAN' | 'COUNSELLOR' | 'ADMIN';

export interface User {
  id: string;
  role: UserRole;
  display_name: string;
  email: string;
  phone?: string | null;
  class_level?: string | null;
  school_id?: string | null;
  preferred_language?: string;
  is_minor?: boolean;
  password_hash?: string;
  is_email_verified: boolean;
  email_verified_at?: Date | string | null;
  created_at?: Date | string;
  updated_at?: Date | string;
  last_active_at?: Date | string | null;
}

export interface CreateUserData {
  role?: UserRole;
  display_name: string;
  email: string;
  phone?: string | null;
  class_level?: string | null;
  school_id?: string | null;
  preferred_language?: string;
  is_minor?: boolean;
  password_hash: string;
}

export interface Session {
  id: string;
  user_id: string;
  device_type: string;
  app_version: string;
  started_at: Date | string;
  ended_at?: Date | string | null;
}

export interface EmailVerificationCode {
  id: string;
  user_id: string;
  code: string;
  expires_at: Date | string;
  created_at: Date | string;
}

export interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
  is_email_verified: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export interface SendVerificationEmailOptions {
  email: string;
  name: string;
  code: string;
}

export type AcademicStream = 'SCIENCE' | 'COMMERCE' | 'HUMANITIES' | 'VOCATIONAL' | 'OTHER';
export type SubjectCategory = 'CORE' | 'ELECTIVE' | 'ADDITIONAL' | 'OTHER';

export interface SubjectInput {
  subject_name: string;
  subject_category?: SubjectCategory;
  marks_obtained: number;
  maximum_marks: number;
  grade?: string | null;
}

export interface StudentProfile {
  id: string | number;
  user_id: string | number;
  student_name: string;
  current_class: number;
  phone_number?: string | null;
  contact_email?: string | null;
  father_name: string;
  father_occupation?: string | null;
  mother_name: string;
  mother_occupation?: string | null;
  is_completed: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface FamilyProfile {
  id: string | number;
  student_profile_id: string | number;
  relationship: string;
  name: string;
  occupation?: string | null;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface AcademicRecord {
  id: string | number;
  student_profile_id: string | number;
  education_board: string;
  stream?: string | null;
  class_level: number;
  created_at?: Date | string;
  updated_at?: Date | string;
  subjects?: AcademicSubject[];
}

export interface AcademicSubject {
  id: string | number;
  academic_record_id: string | number;
  subject_name: string;
  subject_category: SubjectCategory;
  marks_obtained: number;
  maximum_marks: number;
  grade?: string | null;
  created_at?: Date | string;
}

export interface OnboardingData {
  student_name: string;
  current_class: number;
  phone_number?: string | null;
  contact_email?: string | null;
  father_name: string;
  father_occupation?: string | null;
  mother_name: string;
  mother_occupation?: string | null;
  education_board: string;
  stream?: AcademicStream | string | null;
  subjects: SubjectInput[];
}

