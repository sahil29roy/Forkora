import { Request, Response, NextFunction } from 'express';
import {
  createUser,
  findUserByEmail,
  updateEmailVerified,
  updateLastActive,
} from '../models/userModel';
import {
  createVerificationCode,
  getLatestVerificationCode,
  deleteUserVerificationCodes,
} from '../models/verificationModel';
import { createSession, endSession } from '../models/sessionModel';
import {
  hashPassword,
  comparePassword,
  generateToken,
  generateOTP,
} from '../utils/authUtils';
import { sendVerificationEmail } from '../services/emailService';
import { AuthenticatedRequest, UserRole } from '../types';

const VALID_ROLES: UserRole[] = ['STUDENT', 'GUARDIAN', 'COUNSELLOR', 'ADMIN'];

/**
 * @route   POST /api/auth/signup
 * @desc    Registers a new user and dispatches email verification OTP via Resend API.
 */
export async function signup(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
  try {
    const {
      display_name,
      email,
      password,
      role = 'STUDENT',
      phone,
      class_level,
      school_id,
      preferred_language,
      is_minor,
    } = req.body;

    // Basic Input Validations
    if (!display_name || !display_name.trim()) {
      return res.status(400).json({ error: 'Validation Error', message: 'Input name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Validation Error', message: 'Email address is required.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Validation Error', message: 'Password must be at least 6 characters long.' });
    }

    const upperRole = (role as string).toUpperCase() as UserRole;
    if (!VALID_ROLES.includes(upperRole)) {
      return res.status(400).json({ error: 'Validation Error', message: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` });
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'An account with this email address already exists. Please sign in instead.',
      });
    }

    // Hash password & create user
    const password_hash = await hashPassword(password);
    const user = await createUser({
      role: upperRole,
      display_name: display_name.trim(),
      email: email.trim(),
      phone,
      class_level,
      school_id,
      preferred_language,
      is_minor,
      password_hash,
    });

    // Generate 6-digit OTP for email verification
    const otpCode = generateOTP(6);
    await createVerificationCode(user.id, otpCode, 15); // 15 mins expiry

    // Send verification email via Resend API
    await sendVerificationEmail({
      email: user.email,
      name: user.display_name,
      code: otpCode,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Registration successful! A 6-digit verification code has been sent to your email address.',
      user: {
        id: user.id,
        role: user.role,
        display_name: user.display_name,
        email: user.email,
        is_email_verified: user.is_email_verified,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verifies the 6-digit OTP code sent to user email.
 */
export async function verifyEmail(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Validation Error', message: 'Email and verification code are required.' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'Not Found', message: 'User account not found.' });
    }

    if (user.is_email_verified) {
      const token = generateToken(user);
      return res.status(200).json({
        status: 'success',
        message: 'Your email address is already verified.',
        token,
        user: {
          id: user.id,
          role: user.role,
          display_name: user.display_name,
          email: user.email,
          is_email_verified: true,
        },
      });
    }

    // Retrieve latest code record
    const verificationRecord = await getLatestVerificationCode(user.id);
    if (!verificationRecord) {
      return res.status(400).json({
        error: 'Invalid Code',
        message: 'No active verification code found. Please click "Resend Code" to get a new code.',
      });
    }

    if (verificationRecord.code !== (code as string).trim()) {
      return res.status(400).json({
        error: 'Invalid Code',
        message: 'The verification code provided is incorrect. Please check your email and try again.',
      });
    }

    if (new Date(verificationRecord.expires_at) < new Date()) {
      return res.status(400).json({
        error: 'Code Expired',
        message: 'The verification code has expired. Please use the resend option to request a new code.',
      });
    }

    // Mark email verified & clean up tokens
    const updatedUser = await updateEmailVerified(user.id);
    if (!updatedUser) {
      return res.status(500).json({ error: 'Server Error', message: 'Failed to update verification status.' });
    }

    await deleteUserVerificationCodes(user.id);

    // Create tracking session & generate JWT
    await createSession(user.id);
    const token = generateToken(updatedUser);

    return res.status(200).json({
      status: 'success',
      message: 'Email address verified successfully!',
      token,
      user: {
        id: updatedUser.id,
        role: updatedUser.role,
        display_name: updatedUser.display_name,
        email: updatedUser.email,
        is_email_verified: true,
        email_verified_at: updatedUser.email_verified_at,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resends a fresh 6-digit email verification OTP via Resend API.
 */
export async function resendVerificationCode(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
  try {
    const { email } = req.body;

    if (!email || !(email as string).trim()) {
      return res.status(400).json({ error: 'Validation Error', message: 'Email address is required.' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'Not Found', message: 'No account found with this email address.' });
    }

    if (user.is_email_verified) {
      return res.status(400).json({
        error: 'Already Verified',
        message: 'This email address has already been verified. You can sign in directly.',
      });
    }

    // Generate new OTP & store
    const newOtpCode = generateOTP(6);
    await createVerificationCode(user.id, newOtpCode, 15);

    // Dispatch email via Resend
    await sendVerificationEmail({
      email: user.email,
      name: user.display_name,
      code: newOtpCode,
    });

    return res.status(200).json({
      status: 'success',
      message: 'A new verification code has been sent to your email address.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   POST /api/auth/signin
 * @desc    Authenticates credentials and returns JWT session token.
 */
export async function signin(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
  try {
    const { email, password, device_type = 'web', app_version = '1.0.0' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Validation Error', message: 'Email and password are required.' });
    }

    const user = await findUserByEmail(email);
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Authentication Failed', message: 'Invalid email or password.' });
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Authentication Failed', message: 'Invalid email or password.' });
    }

    // Update active timestamp & create session record
    await updateLastActive(user.id);
    const session = await createSession(user.id, device_type, app_version);

    // Generate token
    const token = generateToken(user);

    return res.status(200).json({
      status: 'success',
      message: 'Sign in successful!',
      token,
      sessionId: session.id,
      user: {
        id: user.id,
        role: user.role,
        display_name: user.display_name,
        email: user.email,
        is_email_verified: user.is_email_verified,
        class_level: user.class_level,
        school_id: user.school_id,
        preferred_language: user.preferred_language,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   GET /api/auth/me
 * @desc    Gets authenticated user profile.
 */
export async function me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
  try {
    const user = req.user;
    return res.status(200).json({
      status: 'success',
      user,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   POST /api/auth/signout
 * @desc    Ends active session.
 */
export async function signout(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
  try {
    const { sessionId } = req.body;
    if (sessionId) {
      await endSession(sessionId);
    }

    return res.status(200).json({
      status: 'success',
      message: 'Sign out successful.',
    });
  } catch (err) {
    next(err);
  }
}
