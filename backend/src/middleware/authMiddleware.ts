import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/authUtils';
import { findUserById } from '../models/userModel';
import { AuthenticatedRequest } from '../types';

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      error: 'Access Denied',
      message: 'Authentication token is required. Please sign in.',
    });
  }

  try {
    const decoded = verifyToken(token);
    const user = await findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        error: 'Invalid Token',
        message: 'The user associated with this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token Expired',
        message: 'Your session has expired. Please sign in again.',
      });
    }

    return res.status(401).json({
      error: 'Invalid Token',
      message: 'Failed to authenticate token.',
    });
  }
}

export function requireEmailVerified(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Response | void {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
  }

  if (!req.user.is_email_verified) {
    return res.status(403).json({
      error: 'Email Not Verified',
      message: 'Please verify your email address to access this feature.',
      is_email_verified: false,
    });
  }

  next();
}
