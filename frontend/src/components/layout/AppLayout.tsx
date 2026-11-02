import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, ChevronRight } from 'lucide-react'
import { AppSidebar } from './AppSidebar'
import { ThemeSelector } from '@/components/auth/ThemeSelector'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface AppLayoutProps {
  breadcrumbs?: BreadcrumbItem[]
  headerRight?: React.ReactNode
  children: React.ReactNode
}

export function AppLayout({ breadcrumbs = [], headerRight, children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex antialiased selection:bg-primary/20 selection:text-primary">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:flex h-screen sticky top-0 shrink-0 z-30">
        <AppSidebar />
      </div>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 h-16 md:h-18 px-4 sm:px-6 lg:px-8 bg-background/85 backdrop-blur-md border-b border-border/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Hamburger Trigger */}
            <div className="lg:hidden">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-xl border-border"
                    aria-label="Open navigation menu"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64 border-r border-border">
                  <AppSidebar onItemClick={() => setMobileOpen(false)} />
                </SheetContent>
              </Sheet>
            </div>

            {/* Breadcrumb Navigation */}
            {breadcrumbs.length > 0 && (
              <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs sm:text-sm">
                {breadcrumbs.map((crumb, idx) => {
                  const isLast = idx === breadcrumbs.length - 1

                  return (
                    <div key={crumb.label} className="flex items-center gap-1.5">
                      {idx > 0 && (
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                      )}
                      {crumb.href && !isLast ? (
                        <Link
                          to={crumb.href}
                          className="text-muted hover:text-foreground font-medium transition-colors"
                        >
                          {crumb.label}
                        </Link>
                      ) : (
                        <span
                          className={
                            isLast
                              ? 'font-bold text-foreground'
                              : 'text-muted font-medium'
                          }
                          aria-current={isLast ? 'page' : undefined}
                        >
                          {crumb.label}
                        </span>
                      )}
                    </div>
                  )
                })}
              </nav>
            )}
          </div>

          {/* Top Right Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {headerRight}
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {children}
        </main>
      </div>
    </div>
  )
}
