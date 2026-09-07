export interface AuthUser {
  id: string
  role: 'STUDENT' | 'GUARDIAN' | 'COUNSELLOR' | 'ADMIN'
  display_name: string
  email: string
  is_email_verified: boolean
  class_level?: number | null
  school_id?: number | null
  preferred_language?: string | null
  created_at?: string
}

export interface SignInCredentials {
  email: string
  password: string
  device_type?: string
  app_version?: string
}

export interface SignInResponse {
  status: 'success'
  message: string
  token: string
  sessionId: string
  user: AuthUser
}

export interface SignUpData {
  display_name: string
  email: string
  password: string
  role?: 'STUDENT' | 'GUARDIAN' | 'COUNSELLOR' | 'ADMIN'
  phone?: string
  class_level?: number
  school_id?: number
  preferred_language?: string
  is_minor?: boolean
}

export interface SignUpResponse {
  status: 'success'
  message: string
  user: AuthUser
}

export interface VerifyEmailData {
  email: string
  code: string
}

export interface VerifyEmailResponse {
  status: 'success'
  message: string
  token: string
  user: AuthUser
}

export interface AuthApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

const API_BASE_URL = '/api/auth'

export class AuthApiError extends Error {
  statusCode: number
  errorType?: string

  constructor(message: string, statusCode: number, errorType?: string) {
    super(message)
    this.name = 'AuthApiError'
    this.statusCode = statusCode
    this.errorType = errorType
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const isJson = res.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await res.json() : null

  if (!res.ok) {
    const errorType = data?.error || 'Error'
    const errorMessage =
      data?.message ||
      (res.status === 401
        ? 'Invalid email or password.'
        : res.status === 409
        ? 'An account with this email address already exists. Please sign in instead.'
        : res.status === 500
        ? 'Server error occurred. Please try again shortly.'
        : `Request failed with status ${res.status}`)

    throw new AuthApiError(errorMessage, res.status, errorType)
  }

  return data as T
}

export const authApi = {
  /**
   * Authenticates user credentials and returns JWT token & user object.
   */
  async signIn(credentials: SignInCredentials): Promise<SignInResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email.trim(),
          password: credentials.password,
          device_type: credentials.device_type || 'web',
          app_version: credentials.app_version || '1.0.0',
        }),
      })
      return await handleResponse<SignInResponse>(res)
    } catch (err: any) {
      if (err instanceof AuthApiError) throw err
      throw new AuthApiError(
        'Unable to connect to the authentication server. Please check your internet connection.',
        0,
        'NetworkError'
      )
    }
  },

  /**
   * Registers a new user account.
   */
  async signUp(data: SignUpData): Promise<SignUpResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          display_name: data.display_name.trim(),
          email: data.email.trim(),
          password: data.password,
          role: data.role || 'STUDENT',
          phone: data.phone,
          class_level: data.class_level,
          school_id: data.school_id,
          preferred_language: data.preferred_language || 'en',
          is_minor: data.is_minor || false,
        }),
      })
      return await handleResponse<SignUpResponse>(res)
    } catch (err: any) {
      if (err instanceof AuthApiError) throw err
      throw new AuthApiError(
        'Unable to connect to the authentication server. Please check your internet connection.',
        0,
        'NetworkError'
      )
    }
  },

  /**
   * Verifies OTP code for email verification.
   */
  async verifyEmail(data: VerifyEmailData): Promise<VerifyEmailResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email.trim(),
          code: data.code.trim(),
        }),
      })
      return await handleResponse<VerifyEmailResponse>(res)
    } catch (err: any) {
      if (err instanceof AuthApiError) throw err
      throw new AuthApiError('Failed to verify email code.', 0, 'NetworkError')
    }
  },

  /**
   * Resends verification OTP code.
   */
  async resendVerification(email: string): Promise<{ status: string; message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      })
      return await handleResponse<{ status: string; message: string }>(res)
    } catch (err: any) {
      if (err instanceof AuthApiError) throw err
      throw new AuthApiError('Failed to resend verification code.', 0, 'NetworkError')
    }
  },

  /**
   * Fetches current authenticated user profile.
   */
  async getProfile(token: string): Promise<{ status: string; user: AuthUser }> {
    try {
      const res = await fetch(`${API_BASE_URL}/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      return await handleResponse<{ status: string; user: AuthUser }>(res)
    } catch (err: any) {
      if (err instanceof AuthApiError) throw err
      throw new AuthApiError('Failed to fetch user profile.', 0, 'NetworkError')
    }
  },

  /**
   * Signs out user session.
   */
  async signOut(sessionId?: string, token?: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/signout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ sessionId }),
      })
    } catch (err) {
      console.error('Sign out error:', err)
    }
  },

  /**
   * Initiates Google OAuth flow.
   */
  initiateGoogleAuth(): void {
    // Navigates to Google OAuth endpoint if backend provides it or redirects with callback
    window.location.href = '/api/auth/google'
  },
}
