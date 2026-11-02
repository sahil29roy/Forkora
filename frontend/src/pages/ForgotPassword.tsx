import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Mail,
  CheckCircle2,
  Loader2,
  AlertCircle,
  KeyRound,
  RotateCw,
  ArrowRight,
} from 'lucide-react'
import { ForkoraLogo } from '@/components/brand/ForkoraLogo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ThemeSelector } from '@/components/auth/ThemeSelector'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { authApi, AuthApiError } from '@/services/auth/authApi'

type ResetStep = 'request' | 'verify_reset' | 'reset_success'

export function ForgotPassword() {
  const navigate = useNavigate()

  // Step state
  const [step, setStep] = useState<ResetStep>('request')

  // Form inputs
  const [email, setEmail] = useState('')
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Status & feedback
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(60)
  const [error, setError] = useState<string | null>(null)
  const [successInfo, setSuccessInfo] = useState<string | null>(null)
  const [devOtp, setDevOtp] = useState<string | null>(null)
  const [redirectCountdown, setRedirectCountdown] = useState(3)

  // Resend cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null
    if (step === 'verify_reset' && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0))
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [step, resendCooldown])

  // Success auto-redirect timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null
    if (step === 'reset_success') {
      if (redirectCountdown <= 1) {
        navigate('/login', {
          state: {
            email: email.trim(),
            message: 'Password reset successfully! Please sign in with your new password.',
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
  }, [step, redirectCountdown, email, navigate])

  // Focus first digit box when moving to verify_reset
  useEffect(() => {
    if (step === 'verify_reset') {
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    }
  }, [step])

  // Handle Step 1: Send Reset Code
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanEmail = email.trim()
    if (!cleanEmail) {
      setError('Please enter your email address.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    setIsLoading(true)

    try {
      const res = await authApi.forgotPassword(cleanEmail)
      if (res.devOtp) setDevOtp(res.devOtp)
      setResendCooldown(60)
      setOtpDigits(['', '', '', '', '', ''])
      setNewPassword('')
      setConfirmPassword('')
      setSuccessInfo('A 6-digit verification code has been dispatched to your email.')
      setStep('verify_reset')
    } catch (err: any) {
      if (err instanceof AuthApiError) {
        setError(err.message)
      } else {
        setError('Failed to send reset code. Please check your internet connection.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle single digit input
  const handleDigitChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, '').slice(-1)
    const newDigits = [...otpDigits]
    newDigits[index] = char
    setOtpDigits(newDigits)
    if (error) setError(null)

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

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

  const handlePasteOtp = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').trim().replace(/\D/g, '')
    if (!pasted) return

    const newDigits = [...otpDigits]
    for (let i = 0; i < 6; i++) {
      if (i < pasted.length) newDigits[i] = pasted[i]
    }
    setOtpDigits(newDigits)
    if (error) setError(null)

    const focusIndex = Math.min(pasted.length, 5)
    inputRefs.current[focusIndex]?.focus()
  }

  // Handle Resending Reset Code
  const handleResendCode = async () => {
    if (resendCooldown > 0 || isResending) return
    setIsResending(true)
    setError(null)
    setSuccessInfo(null)

    try {
      const res = await authApi.forgotPassword(email.trim())
      setResendCooldown(60)
      if (res.devOtp) setDevOtp(res.devOtp)
      setSuccessInfo('A fresh reset code has been sent to your email.')
    } catch (err: any) {
      setError(err?.message || 'Failed to resend reset code.')
    } finally {
      setIsResending(false)
    }
  }

  // Handle Step 2: Submit Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const code = otpDigits.join('')
    if (code.length < 6) {
      setError('Please enter all 6 digits of the reset code.')
      return
    }

    if (!newPassword) {
      setError('Please create a new password.')
      return
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }
    if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setError('Password must contain both letters and numbers.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsLoading(true)

    try {
      await authApi.resetPassword({
        email: email.trim(),
        code,
        newPassword,
      })
      setStep('reset_success')
    } catch (err: any) {
      if (err instanceof AuthApiError) {
        setError(err.message)
      } else {
        setError('Failed to reset password. Please check your reset code and try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col antialiased">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-6 py-5 lg:px-12 lg:py-6">
        <ForkoraLogo />
        <ThemeSelector />
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md p-8 rounded-2xl bg-card border border-border shadow-lg space-y-6 animate-fade-in text-left">
          
          {/* STEP 3: RESET SUCCESS VIEW */}
          {step === 'reset_success' && (
            <div className="space-y-4 text-center py-4 animate-fade-in">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                  Password Reset Successfully!
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your password has been changed. You can now log in to your account with your new credentials.
                </p>
              </div>

              <div className="pt-2 space-y-3">
                <Button
                  onClick={() =>
                    navigate('/login', {
                      state: {
                        email: email.trim(),
                        message: 'Password reset successfully! Please sign in with your new password.',
                      },
                    })
                  }
                  className="w-full h-11 text-sm font-semibold rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground shadow-sm hover:shadow transition-all duration-150 flex items-center justify-center gap-2"
                >
                  <span>Sign In Now</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <p className="text-xs text-muted-foreground">
                  Redirecting to Sign In in{' '}
                  <span className="font-semibold text-foreground font-mono">{redirectCountdown}s</span>...
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: VERIFY CODE & SET NEW PASSWORD */}
          {step === 'verify_reset' && (
            <div className="space-y-5 animate-fade-in">
              <button
                type="button"
                onClick={() => {
                  setStep('request')
                  setError(null)
                  setSuccessInfo(null)
                }}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                <span>Change email address</span>
              </button>

              <div className="space-y-1.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-1 border border-primary/20">
                  <KeyRound className="h-6 w-6 stroke-[1.8]" />
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                  Create new password
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Enter the 6-digit code sent to{' '}
                  <strong className="text-foreground font-semibold">{email.trim()}</strong> and choose a new password.
                </p>
              </div>

              {/* Dev Helper Badge */}
              {devOtp && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
                  <span className="font-medium">Testing Mode Code:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpDigits(devOtp.split(''))
                    }}
                    className="font-mono font-bold tracking-widest bg-amber-500/20 hover:bg-amber-500/30 px-2 py-0.5 rounded cursor-pointer transition-colors"
                  >
                    {devOtp} (Fill)
                  </button>
                </div>
              )}

              {error && (
                <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <AlertDescription className="text-xs sm:text-sm font-medium">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {successInfo && (
                <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <AlertDescription className="text-xs sm:text-sm font-medium">
                    {successInfo}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
                {/* 6-Digit OTP */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Enter 6-digit reset code
                  </Label>
                  <div className="flex items-center justify-between gap-2">
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
                        disabled={isLoading}
                        className={`w-11 h-13 text-center text-xl font-bold font-mono rounded-lg border bg-card text-foreground shadow-xs transition-all outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 ${
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
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <span className="text-muted-foreground">Didn't receive the code?</span>
                  {resendCooldown > 0 ? (
                    <span className="text-muted-foreground font-medium">
                      Resend in <span className="font-semibold text-foreground font-mono">{resendCooldown}s</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendCode}
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

                {/* New Password */}
                <div className="space-y-1">
                  <Label htmlFor="reset-new-password">New Password</Label>
                  <PasswordInput
                    id="reset-new-password"
                    placeholder="Create a new password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value)
                      if (error) setError(null)
                    }}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    Must be at least 8 characters with a mix of letters and numbers.
                  </p>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1">
                  <Label htmlFor="reset-confirm-password">Confirm New Password</Label>
                  <PasswordInput
                    id="reset-confirm-password"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      if (error) setError(null)
                    }}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || otpDigits.some((d) => !d) || !newPassword || !confirmPassword}
                  className="w-full h-11 text-sm font-semibold rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground shadow-sm hover:shadow transition-all duration-150 mt-2"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating password...
                    </span>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </form>
            </div>
          )}

          {/* STEP 1: REQUEST RESET LINK / CODE */}
          {step === 'request' && (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                Back to Log In
              </Link>

              <div className="space-y-1.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-1 border border-primary/20">
                  <Mail className="h-6 w-6 stroke-[1.8]" />
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                  Reset Password
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Enter your email address and we'll dispatch a 6-digit verification code to reset your password.
                </p>
              </div>

              {error && (
                <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <AlertDescription className="text-xs sm:text-sm font-medium">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleRequestReset} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="reset-email">Email Address</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your registered email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (error) setError(null)
                    }}
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="w-full h-11 text-sm font-semibold rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground shadow-sm hover:shadow transition-all duration-150"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending reset code...
                    </span>
                  ) : (
                    'Send Reset Code'
                  )}
                </Button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
