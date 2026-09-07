import { GitBranch, Shield, Sparkles } from 'lucide-react'

export function Footer() {
  const footerSections = [
    {
      title: 'Product',
      links: [
        { label: 'Explore Paths', href: '#pathway-preview' },
        { label: 'Assessment', href: '#how-it-works' },
        { label: 'Path Comparison', href: '#simulation' },
        { label: 'Saved Paths', href: '#how-it-works' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'How It Works', href: '#how-it-works' },
        { label: 'Career Insights', href: '#features' },
        { label: 'Eligibility Engine', href: '#features' },
        { label: 'Help Center', href: '#' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Forkora', href: '#' },
        { label: 'Contact', href: '#' },
        { label: 'Student Advisory', href: '#' },
        { label: 'Careers', href: '#' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '#' },
        { label: 'Terms of Service', href: '#' },
        { label: 'Parental Consent', href: '#' },
        { label: 'Security & Integrity', href: '#' },
      ],
    },
  ]

  return (
    <footer id="resources" className="w-full border-t border-border bg-card/60 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 flex flex-col space-y-4">
            <a href="#" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                <GitBranch className="h-4.5 w-4.5 rotate-90" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                Forkora
              </span>
            </a>

            <p className="text-sm font-medium text-foreground/80">
              Explore. Compare. Decide.
            </p>

            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              Empowering students and guardians to navigate academic decisions, evaluate career flexibility, and explore transition pathways with clarity and deterministic rigor.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground border border-border">
                <Shield className="h-3.5 w-3.5 text-accent" />
                Deterministic Rules
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground border border-border">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                No Black-box Guessing
              </span>
            </div>
          </div>

          {/* Links Columns */}
          {footerSections.map((section) => (
            <div key={section.title} className="col-span-1 flex flex-col space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-150"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-border pt-8 text-xs text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} Forkora. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Cookies</a>
            <span className="text-muted-foreground/60">•</span>
            <span>Target Viewport: 1440 × 900 Optimized</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
