import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Loader2,
  AlertCircle,
  User,
  Mail,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  RotateCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PasswordInput } from './PasswordInput'
import { SocialAuthButtons } from './SocialAuthButtons'
import { useAuth } from '@/context/AuthContext'
import { authApi, AuthApiError } from '@/services/auth/authApi'

type SignupStep = 'details' | 'otp' | 'verified_success'

export function SignupForm() {
  const navigate = useNavigate()
  const { signUp } = useAuth()

  // Form Fields
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)

  // Step Management
  const [step, setStep] = useState<SignupStep>('details')
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [devOtp, setDevOtp] = useState<string | null>(null)

  // OTP State
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [resendCooldown, setResendCooldown] = useState<number>(60)
  const [isResending, setIsResending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [otpError, setOtpError] = useState<string | null>(null)
  const [otpSuccessMessage, setOtpSuccessMessage] = useState<string | null>(null)

  // Duplicate Account Check State
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [emailExists, setEmailExists] = useState<boolean | null>(null)
  const [isExistingUnverified, setIsExistingUnverified] = useState(false)

  // Form Errors & Loading
  const [errors, setErrors] = useState<{
    displayName?: string
    email?: string
    password?: string
    confirmPassword?: string
    terms?: string
  }>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Redirect Countdown for Success Step
  const [redirectCountdown, setRedirectCountdown] = useState<number>(4)

  // 1. Resend OTP countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null
    if (step === 'otp' && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0))
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [step, resendCooldown])

  // 2. Success redirect countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null
    if (step === 'verified_success') {
      if (redirectCountdown <= 1) {
        navigate('/login', {
          state: {
            email: registeredEmail,
            message: 'Email verified successfully! Please sign in with your password.',
          },
        })
      } else {
        timer = setInterval(() => {
          setRedirectCountdown((prev) => prev - 1)
        }, 1000)
      }
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [step, redirectCountdown, registeredEmail, navigate])

  // 3. Focus first OTP input when transitioning to OTP step
  useEffect(() => {
    if (step === 'otp') {
      const firstInput = inputRefs.current[0]
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100)
      }
    }
  }, [step])

  // Email format validator
  const isValidEmail = (val: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())
  }

  // Check email duplication when user finishes typing / blurs
  const handleEmailBlur = async () => {
    const cleanEmail = email.trim()
    if (!cleanEmail || !isValidEmail(cleanEmail)) return

    try {
      setIsCheckingEmail(true)
      const res = await authApi.checkEmail(cleanEmail)
      if (res.exists) {
        setEmailExists(true)
        setIsExistingUnverified(Boolean(res.is_email_verified === false))
        setErrors((prev) => ({
          ...prev,
          email: 'An account with this email address already exists.',
        }))
      } else {
        setEmailExists(false)
        setIsExistingUnverified(false)
        setErrors((prev) => ({ ...prev, email: undefined }))
      }
    } catch {
      // Ignore network errors on background duplicate check
    } finally {
      setIsCheckingEmail(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}

    if (!displayName.trim()) {
      newErrors.displayName = 'Please enter your full name.'
    }

    if (!email.trim()) {
      newErrors.email = 'Please enter your email address.'
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address.'
    } else if (emailExists) {
      newErrors.email = 'An account with this email address already exists. Please sign in instead.'
    }

    if (!password) {
      newErrors.password = 'Please create a password.'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.'
    } else if (/\s/.test(password)) {
      newErrors.password = 'Password cannot contain spaces.'
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
      const res = await signUp({
        display_name: displayName.trim(),
        email: email.trim(),
        password,
        role: 'STUDENT',
      })

      // Account created successfully -> Re-render into OTP verification view!
      setRegisteredEmail(email.trim())
      setDevOtp(res.devOtp || null)
      setOtpDigits(['', '', '', '', '', ''])
      setOtpError(null)
      setOtpSuccessMessage(null)
      setResendCooldown(60)
      setStep('otp')
    } catch (err: any) {
      if (err instanceof AuthApiError) {
        if (err.statusCode === 409) {
          setEmailExists(true)
          if (err.data?.is_email_verified === false) {
            setIsExistingUnverified(true)
          }
        }
        setServerError(err.message)
      } else {
        setServerError('Failed to create account. Please check your details and try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle single digit input change
  const handleDigitChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, '').slice(-1)
    const newDigits = [...otpDigits]
    newDigits[index] = char
    setOtpDigits(newDigits)
    if (otpError) setOtpError(null)

    // Advance to next box if char entered
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Handle backspace navigation
  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Handle pasting full 6-digit OTP
  const handlePasteOtp = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').trim().replace(/\D/g, '')
    if (!pasted) return

    const newDigits = [...otpDigits]
    for (let i = 0; i < 6; i++) {
      if (i < pasted.length) {
        newDigits[i] = pasted[i]
      }
    }
    setOtpDigits(newDigits)
    if (otpError) setOtpError(null)

    const focusIndex = Math.min(pasted.length, 5)
    inputRefs.current[focusIndex]?.focus()
  }

  // Resend OTP code
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return
    setIsResending(true)
    setOtpError(null)
    setOtpSuccessMessage(null)

    try {
      const res = await authApi.resendVerification(registeredEmail || email.trim())
      setResendCooldown(60)
      if (res.devOtp) {
        setDevOtp(res.devOtp)
      }
      setOtpSuccessMessage('A fresh verification code has been dispatched to your email address.')
    } catch (err: any) {
      setOtpError(err?.message || 'Failed to resend verification code. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  // Switch to OTP for an existing unverified account
  const handleVerifyExistingAccount = async () => {
    const targetEmail = email.trim()
    if (!targetEmail) return
    setIsLoading(true)
    setServerError(null)

    try {
      const res = await authApi.resendVerification(targetEmail)
      setRegisteredEmail(targetEmail)
      if (res.devOtp) setDevOtp(res.devOtp)
      setOtpDigits(['', '', '', '', '', ''])
      setOtpError(null)
      setOtpSuccessMessage('A new verification code has been dispatched to your email address.')
      setResendCooldown(60)
      setStep('otp')
    } catch (err: any) {
      setServerError(err?.message || 'Failed to dispatch verification code.')
    } finally {
      setIsLoading(false)
    }
  }

  // Verify OTP submission
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const code = otpDigits.join('')

    if (code.length < 6) {
      setOtpError('Please enter all 6 digits of the verification code.')
      return
    }

    setIsVerifying(true)
    setOtpError(null)

    try {
      await authApi.verifyEmail({
        email: registeredEmail,
        code,
      })

      // CRITICAL: Do NOT jump to onboarding!
      // Move to verified success state which directs user to the Sign In option!
      setStep('verified_success')
    } catch (err: any) {
      setOtpError(err?.message || 'Verification failed. Please check your code and try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  // --------------------------------------------------------------------------
  // STEP 3: VERIFIED SUCCESS VIEW (Moves user to Sign In option, NOT onboarding)
  // --------------------------------------------------------------------------
  if (step === 'verified_success') {
    return (
      <div className="w-full space-y-6 animate-fade-in text-center py-4">
        {/* Animated Checkmark Badge */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Email Verified Successfully!
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Your Forkora account has been verified. Please sign in to access your dashboard and explore career recommendations.
          </p>
        </div>

        <div className="pt-2 space-y-3">
          <Button
            type="button"
            onClick={() =>
              navigate('/login', {
                state: {
                  email: registeredEmail,
                  message: 'Email verified successfully! Please sign in with your password.',
                },
              })
            }
            className="w-full h-11 text-sm font-semibold rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground shadow-sm hover:shadow transition-all duration-150 flex items-center justify-center gap-2"
          >
            <span>Move to Sign In</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <p className="text-xs text-muted-foreground">
            Redirecting to Sign In in{' '}
            <span className="font-semibold text-foreground">{redirectCountdown}s</span>...
          </p>
        </div>
      </div>
    )
  }

  // --------------------------------------------------------------------------
  // STEP 2: OTP VERIFICATION VIEW (Re-rendered upon successful signup)
  // --------------------------------------------------------------------------
  if (step === 'otp') {
    const isCodeComplete = otpDigits.every((d) => d.length === 1)

    return (
      <div className="w-full space-y-5 animate-fade-in text-left">
        {/* Back to Edit Details button */}
        <button
          type="button"
          onClick={() => {
            setStep('details')
            setOtpError(null)
          }}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Edit signup details</span>
        </button>

        {/* Header */}
        <div className="space-y-1.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-1 border border-primary/20">
            <ShieldCheck className="h-6 w-6 stroke-[1.8]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Verify your email
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We sent a 6-digit verification code to{' '}
            <strong className="text-foreground font-semibold">{registeredEmail}</strong>.
          </p>
        </div>

        {/* Development mode OTP helper badge */}
        {devOtp && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
            <span className="font-medium">Testing Mode OTP:</span>
            <button
              type="button"
              onClick={() => {
                const chars = devOtp.split('')
                setOtpDigits(chars)
              }}
              className="font-mono font-bold tracking-widest bg-amber-500/20 hover:bg-amber-500/30 px-2 py-0.5 rounded cursor-pointer transition-colors"
              title="Click to auto-fill"
            >
              {devOtp} (Fill)
            </button>
          </div>
        )}

        {/* Status Alert (Error or Resend Notification) */}
        {otpError && (
          <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <AlertDescription className="text-xs sm:text-sm font-medium">
              {otpError}
            </AlertDescription>
          </Alert>
        )}

        {otpSuccessMessage && (
          <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <AlertDescription className="text-xs sm:text-sm font-medium">
              {otpSuccessMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* 6-Digit OTP Form */}
        <form onSubmit={handleVerifyOtp} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground">
              Enter 6-digit code
            </Label>
            <div className="flex items-center justify-between gap-2 sm:gap-2.5">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                  onPaste={handlePasteOtp}
                  disabled={isVerifying}
                  className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold font-mono rounded-lg border bg-card text-foreground shadow-xs transition-all outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 ${
                    digit
                      ? 'border-primary/60 bg-primary/5'
                      : 'border-border hover:border-muted-foreground/40'
                  }`}
                  aria-label={`Digit ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Resend Action */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-muted-foreground">Didn't receive the code?</span>
            {resendCooldown > 0 ? (
              <span className="text-muted-foreground/80 font-medium">
                Resend in{' '}
                <span className="font-semibold text-foreground font-mono">{resendCooldown}s</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResending}
                className="text-primary hover:text-primary-hover font-semibold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {isResending ? (
                  <>
                    <RotateCw className="h-3 w-3 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Resend Code</span>
                )}
              </button>
            )}
          </div>

          {/* Verify Button */}
          <Button
            type="submit"
            disabled={isVerifying || !isCodeComplete}
            className="w-full h-11 text-sm font-semibold rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground shadow-sm hover:shadow transition-all duration-150 disabled:opacity-50"
          >
            {isVerifying ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying code...
              </span>
            ) : (
              'Verify Email'
            )}
          </Button>

          {/* Direct Sign In option link */}
          <div className="text-center pt-2">
            <Link
              to="/login"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Already verified? <span className="text-primary underline">Sign In</span>
            </Link>
          </div>
        </form>
      </div>
    )
  }

  // --------------------------------------------------------------------------
  // STEP 1: INITIAL SIGNUP FORM (With duplicate account checking)
  // --------------------------------------------------------------------------
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

      {/* Duplicate Account Alert */}
      {emailExists && (
        <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-xs sm:text-sm font-medium space-y-2">
            <p>
              An account with <strong className="font-semibold">{email}</strong> already exists.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                onClick={() =>
                  navigate('/login', {
                    state: { email },
                  })
                }
                className="h-8 px-3 text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-md shadow-xs"
              >
                Sign In Now
              </Button>
              {isExistingUnverified && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleVerifyExistingAccount}
                  disabled={isLoading}
                  className="h-8 px-3 text-xs border-amber-600/40 text-amber-800 dark:text-amber-200 hover:bg-amber-500/10 font-medium rounded-md"
                >
                  Verify with OTP
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Other Server Errors Alert */}
      {serverError && !emailExists && (
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

        {/* Email with Duplicate Account Verification */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="signup-email">Email</Label>
            {isCheckingEmail && (
              <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                <Loader2 className="h-3 w-3 animate-spin" />
                Checking availability...
              </span>
            )}
          </div>
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute left-3.5 flex items-center justify-center text-muted-foreground">
              <Mail className="h-4 w-4 stroke-[1.8]" />
            </div>
            <Input
              id="signup-email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onBlur={handleEmailBlur}
              onChange={(e) => {
                setEmail(e.target.value)
                if (emailExists) {
                  setEmailExists(null)
                  setIsExistingUnverified(false)
                }
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
                if (serverError) setServerError(null)
              }}
              disabled={isLoading}
              autoComplete="email"
              aria-invalid={Boolean(errors.email || emailExists)}
              className={`pl-10 ${
                errors.email || emailExists
                  ? 'border-destructive focus-visible:ring-destructive'
                  : ''
              }`}
            />
          </div>
          {errors.email && (
            <div className="flex items-center justify-between text-xs text-destructive font-medium mt-1">
              <span>{errors.email}</span>
              {emailExists && (
                <button
                  type="button"
                  onClick={() => navigate('/login', { state: { email } })}
                  className="text-primary hover:underline font-semibold cursor-pointer ml-2"
                >
                  Sign In
                </button>
              )}
            </div>
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
