import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  authApi,
  type AuthUser,
  type SignInCredentials,
  type SignUpData,
} from '@/services/auth/authApi'

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  sessionId: string | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (credentials: SignInCredentials) => Promise<{ user: AuthUser; shouldOnboard: boolean }>
  signUp: (data: SignUpData) => Promise<{ user: AuthUser }>
  signOut: () => Promise<void>
  checkProfile: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'forkora_auth_token'
const SESSION_KEY = 'forkora_session_id'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [sessionId, setSessionId] = useState<string | null>(() => localStorage.getItem(SESSION_KEY))
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const checkProfile = useCallback(async (): Promise<boolean> => {
    if (!token) return false
    try {
      const response = await authApi.getProfile(token)
      if (response.user) {
        setUser(response.user)
        // Profile is complete if class_level or school_id is set
        return Boolean(response.user.class_level || response.user.school_id)
      }
      return false
    } catch {
      // Invalid token or expired session
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(SESSION_KEY)
      setToken(null)
      setUser(null)
      return false
    }
  }, [token])

  useEffect(() => {
    let isMounted = true
    const initAuth = async () => {
      if (token) {
        try {
          const res = await authApi.getProfile(token)
          if (isMounted && res.user) {
            setUser(res.user)
          }
        } catch {
          if (isMounted) {
            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem(SESSION_KEY)
            setToken(null)
            setUser(null)
          }
        }
      }
      if (isMounted) {
        setIsLoading(false)
      }
    }

    initAuth()
    return () => {
      isMounted = false
    }
  }, [token])

  const signIn = async (credentials: SignInCredentials) => {
    const res = await authApi.signIn(credentials)
    if (res.token) {
      localStorage.setItem(TOKEN_KEY, res.token)
      setToken(res.token)
    }
    if (res.sessionId) {
      localStorage.setItem(SESSION_KEY, res.sessionId)
      setSessionId(res.sessionId)
    }
    setUser(res.user)

    // Check if user has completed onboarding/academic profile
    const shouldOnboard = !res.user.class_level && !res.user.school_id
    return { user: res.user, shouldOnboard }
  }

  const signUp = async (data: SignUpData) => {
    const res = await authApi.signUp(data)
    setUser(res.user)
    return { user: res.user }
  }

  const signOut = async () => {
    try {
      if (sessionId || token) {
        await authApi.signOut(sessionId || undefined, token || undefined)
      }
    } finally {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(SESSION_KEY)
      setToken(null)
      setSessionId(null)
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        sessionId,
        isAuthenticated: Boolean(token && user),
        isLoading,
        signIn,
        signUp,
        signOut,
        checkProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
