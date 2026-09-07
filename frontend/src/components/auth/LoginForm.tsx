import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2, AlertCircle, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PasswordInput } from './PasswordInput'
import { SocialAuthButtons } from './SocialAuthButtons'
import { useAuth } from '@/context/AuthContext'
import { AuthApiError } from '@/services/auth/authApi'

export function LoginForm() {
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email.trim()) {
      newErrors.email = 'Please enter your email address.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.'
    }

    if (!password) {
      newErrors.password = 'Please enter your password.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const { shouldOnboard } = await signIn({ email, password })

      if (shouldOnboard) {
        navigate('/onboarding')
      } else {
        navigate('/dashboard')
      }
    } catch (err: any) {
      if (err instanceof AuthApiError) {
        setServerError(err.message)
      } else {
        setServerError('Invalid email or password. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6 animate-fade-in text-left">
      {/* Form Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Log in to continue your journey and explore new possibilities.
        </p>
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <AlertDescription className="text-xs sm:text-sm font-medium">
            {serverError}
          </AlertDescription>
        </Alert>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email Field */}
        <div className="space-y-1.5">
          <Label htmlFor="login-email">Email</Label>
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute left-3.5 flex items-center justify-center text-muted-foreground">
              <Mail className="h-4 w-4 stroke-[1.8]" />
            </div>
            <Input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
              }}
              disabled={isLoading}
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              className={`pl-10 ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive font-medium mt-1">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Password</Label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-primary hover:text-primary-hover hover:underline transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
              tabIndex={0}
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="login-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
            }}
            disabled={isLoading}
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            className={errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}
          />
          {errors.password && (
            <p className="text-xs text-destructive font-medium mt-1">
              {errors.password}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 text-sm font-semibold rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground shadow-sm hover:shadow transition-all duration-150 mt-2"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </span>
          ) : (
            'Log In'
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative px-3 bg-background text-[13px] text-muted-foreground font-medium">
          or continue with
        </div>
      </div>

      {/* Social Buttons */}
      <SocialAuthButtons isLoading={isLoading} />
    </div>
  )
}
