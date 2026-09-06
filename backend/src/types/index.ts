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
