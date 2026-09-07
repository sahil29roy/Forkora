import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ForkoraLogo } from '@/components/brand/ForkoraLogo'
import { ThemeSelector } from '@/components/auth/ThemeSelector'

export function Terms() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col antialiased">
      <header className="w-full flex items-center justify-between px-6 py-5 lg:px-12 lg:py-6 border-b border-border/50">
        <ForkoraLogo />
        <ThemeSelector />
      </header>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6 text-left">
        <Link
          to="/signup"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Sign Up
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight">Terms of Service</h1>
        <p className="text-sm text-muted">Last updated: September 2026</p>
        <div className="space-y-4 text-sm leading-relaxed text-foreground/90">
          <p>
            Welcome to Forkora. By accessing or using our platform, you agree to comply with and be bound by these Terms of Service.
          </p>
          <h3 className="text-base font-bold text-foreground">1. Acceptance of Terms</h3>
          <p className="text-muted">
            By creating an account or using Forkora's academic career mapping services, you agree to provide true and accurate information.
          </p>
          <h3 className="text-base font-bold text-foreground">2. Student Privacy & Minor Protection</h3>
          <p className="text-muted">
            We adhere strictly to student data protection frameworks. Academic records and career simulations are kept confidential and are not sold to third-party advertisers.
          </p>
        </div>
      </div>
    </div>
  )
}
