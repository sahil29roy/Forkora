import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ForkoraLogo } from '@/components/brand/ForkoraLogo'
import { ThemeSelector } from '@/components/auth/ThemeSelector'

export function Privacy() {
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
        <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-muted">Last updated: September 2026</p>
        <div className="space-y-4 text-sm leading-relaxed text-foreground/90">
          <p>
            Your privacy is of utmost importance to us. This Privacy Policy explains how Forkora collects, uses, and protects personal information.
          </p>
          <h3 className="text-base font-bold text-foreground">1. Information We Collect</h3>
          <p className="text-muted">
            We collect account information such as your name, email address, and academic grade to deliver personalized pathway recommendations.
          </p>
          <h3 className="text-base font-bold text-foreground">2. Security & Compliance</h3>
          <p className="text-muted">
            Passwords and sensitive credentials are encrypted using industry-standard cryptographic algorithms. We do not expose personal contact details publicly.
          </p>
        </div>
      </div>
    </div>
  )
}
