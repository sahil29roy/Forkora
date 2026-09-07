import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2, AlertCircle, User, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PasswordInput } from './PasswordInput'
import { SocialAuthButtons } from './SocialAuthButtons'
import { useAuth } from '@/context/AuthContext'
import { AuthApiError } from '@/services/auth/authApi'

export function SignupForm() {
  const navigate = useNavigate()
  const { signUp } = useAuth()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)

  const [errors, setErrors] = useState<{
    displayName?: string
    email?: string
    password?: string
    confirmPassword?: string
    terms?: string
  }>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}

    if (!displayName.trim()) {
      newErrors.displayName = 'Please enter your full name.'
    }

    if (!email.trim()) {
      newErrors.email = 'Please enter your email address.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.'
    }

    if (!password) {
      newErrors.password = 'Please create a password.'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.'
    } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      newErrors.password = 'Password must contain both letters and numbers.'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.'
    }

    if (!agreeTerms) {
      newErrors.terms = 'You must agree to the Terms of Service and Privacy Policy.'
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
      await signUp({
        display_name: displayName,
        email,
        password,
        role: 'STUDENT',
      })

      navigate('/onboarding')
    } catch (err: any) {
      if (err instanceof AuthApiError) {
        setServerError(err.message)
      } else {
        setServerError('Failed to create account. Please check your details and try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full space-y-5 animate-fade-in text-left">
      {/* Form Header */}
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold tracking-tight text-foreground">
          Create your account
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Join Forkora and start exploring your future.
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

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        {/* Full Name */}
        <div className="space-y-1">
          <Label htmlFor="signup-name">Full Name</Label>
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute left-3.5 flex items-center justify-center text-muted-foreground">
              <User className="h-4 w-4 stroke-[1.8]" />
            </div>
            <Input
              id="signup-name"
              type="text"
              placeholder="Enter your full name"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value)
                if (errors.displayName) setErrors((prev) => ({ ...prev, displayName: undefined }))
              }}
              disabled={isLoading}
              autoComplete="name"
              aria-invalid={Boolean(errors.displayName)}
              className={`pl-10 ${errors.displayName ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            />
          </div>
          {errors.displayName && (
            <p className="text-xs text-destructive font-medium mt-1">
              {errors.displayName}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <Label htmlFor="signup-email">Email</Label>
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute left-3.5 flex items-center justify-center text-muted-foreground">
              <Mail className="h-4 w-4 stroke-[1.8]" />
            </div>
            <Input
              id="signup-email"
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

        {/* Password */}
        <div className="space-y-1">
          <Label htmlFor="signup-password">Password</Label>
          <PasswordInput
            id="signup-password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
            }}
            disabled={isLoading}
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            className={errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}
          />
          {errors.password ? (
            <p className="text-xs text-destructive font-medium mt-1">
              {errors.password}
            </p>
          ) : (
            <p className="text-[11px] text-muted-foreground leading-tight">
              Use at least 8 characters with a mix of letters and numbers.
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <Label htmlFor="signup-confirm-password">Confirm Password</Label>
          <PasswordInput
            id="signup-confirm-password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
            }}
            disabled={isLoading}
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword)}
            className={errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive font-medium mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Terms and Privacy Checkbox */}
        <div className="pt-1 space-y-1">
          <div className="flex items-start gap-2.5">
            <Checkbox
              id="terms"
              checked={agreeTerms}
              onCheckedChange={(checked) => {
                setAgreeTerms(checked === true)
                if (errors.terms) setErrors((prev) => ({ ...prev, terms: undefined }))
              }}
              disabled={isLoading}
              className="mt-0.5"
            />
            <Label
              htmlFor="terms"
              className="text-xs text-muted-foreground leading-snug font-normal cursor-pointer select-none"
            >
              I agree to the{' '}
              <Link
                to="/terms"
                className="text-primary hover:text-primary-hover font-medium underline-offset-2 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                to="/privacy"
                className="text-primary hover:text-primary-hover font-medium underline-offset-2 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                Privacy Policy
              </Link>
              .
            </Label>
          </div>
          {errors.terms && (
            <p className="text-xs text-destructive font-medium">
              {errors.terms}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading || !agreeTerms}
          className="w-full h-11 text-sm font-semibold rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground shadow-sm hover:shadow transition-all duration-150 mt-2 disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </span>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative px-3 bg-background text-[13px] text-muted-foreground font-medium">
          or sign up with
        </div>
      </div>

      {/* Social Button (Google) */}
      <SocialAuthButtons isLoading={isLoading} />
    </div>
  )
}
