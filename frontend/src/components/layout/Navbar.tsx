import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, GitBranch, ArrowRight, BookOpen, Compass, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'How It Works', href: '#how-it-works', icon: Sparkles },
    { label: 'Explore Paths', href: '#pathway-preview', icon: Compass },
    { label: 'Simulation', href: '#simulation', icon: GitBranch },
    { label: 'Resources', href: '#resources', icon: BookOpen },
  ]

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-background/85 backdrop-blur-md border-b border-border shadow-xs'
          : 'bg-background/50 backdrop-blur-xs border-b border-border/40'
      }`}
    >
      <div className="mx-auto flex h-16 md:h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo & Wordmark */}
        <Link to="/" className="flex items-center gap-2.5 group select-none">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/25 transition-transform duration-200 group-hover:scale-105">
            <GitBranch className="h-5 w-5 rotate-90 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-1">
              Forkora
              <span className="h-1.5 w-1.5 rounded-full bg-accent inline-block"></span>
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-lg transition-colors duration-150"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right: Actions (Theme Switcher + Login + Sign Up) */}
        <div className="hidden sm:flex items-center gap-3">
          <ThemeToggle />

          <Button
            asChild
            variant="ghost"
            className="text-sm font-medium text-foreground hover:text-primary hover:bg-muted/50"
          >
            <Link to="/login">Login</Link>
          </Button>

          <Button
            asChild
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium px-4 h-9 shadow-sm shadow-primary/20 transition-all hover:shadow-md"
          >
            <Link to="/signup">
              Sign Up
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Mobile Navigation Trigger */}
        <div className="flex sm:hidden items-center gap-2">
          <ThemeToggle />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 border-border">
                <Menu className="h-5 w-5 text-foreground" />
                <span className="sr-only">Toggle mobile menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] border-border bg-card p-6 flex flex-col justify-between">
              <div className="flex flex-col space-y-6">
                <SheetHeader className="text-left pb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <GitBranch className="h-4 w-4 rotate-90" />
                    </div>
                    <SheetTitle className="text-xl font-bold">Forkora</SheetTitle>
                  </div>
                </SheetHeader>

                <nav className="flex flex-col space-y-2">
                  {navLinks.map((link) => {
                    const Icon = link.icon
                    return (
                      <a
                        key={link.label}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                      >
                        <Icon className="h-4 w-4 text-primary" />
                        {link.label}
                      </a>
                    )
                  })}
                </nav>
              </div>

              <div className="flex flex-col gap-3 pt-6 border-t border-border">
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => setMobileOpen(false)}
                >
                  <Link to="/login">Login</Link>
                </Button>
                <Button
                  asChild
                  className="w-full justify-center bg-primary text-primary-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  <Link to="/signup">
                    Sign Up
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
