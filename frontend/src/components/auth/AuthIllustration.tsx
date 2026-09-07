import { useTheme } from '@/components/theme/ThemeProvider'

interface AuthIllustrationProps {
  type: 'login' | 'signup'
}

export function AuthIllustration({ type }: AuthIllustrationProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const isLogin = type === 'login'

  const content = isLogin
    ? {
        titleLine1: 'Same curiosity.',
        titleLine2: 'A brighter tomorrow.',
        description:
          'Forkora helps you explore, compare and plan your academic and career journey — all in one place.',
        imageSrc: isDark
          ? '/forkora-login-illustration-dark.svg'
          : '/forkora-login-illustration.svg',
        imageAlt: 'Forkora Career & Academic Exploration Illustration',
      }
    : {
        titleLine1: 'Turn your curiosity',
        titleLine2: 'into a clear path.',
        description:
          'Join thousands of students who are exploring, comparing and building a brighter future with Forkora.',
        imageSrc: isDark
          ? '/forkora-signup-illustration-dark.svg'
          : '/forkora-signup-illustration.svg',
        imageAlt: 'Forkora Pathway Building Illustration',
      }

  return (
    <div className="relative h-full w-full flex flex-col justify-between p-8 lg:p-12 xl:p-14 overflow-hidden select-none">
      {/* Subtle Background Ambient Glows */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

      {/* Top Header Typography */}
      <div className="relative z-10 space-y-3 max-w-lg text-left">
        <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold tracking-tight text-foreground leading-[1.2]">
          <span>{content.titleLine1}</span>
          <br />
          <span>{content.titleLine2}</span>
        </h2>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md font-normal">
          {content.description}
        </p>
      </div>

      {/* Center Illustration Artwork */}
      <div className="relative z-10 flex-1 my-4 flex items-center justify-center min-h-[300px] max-h-[460px]">
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            key={content.imageSrc}
            src={content.imageSrc}
            alt={content.imageAlt}
            className="w-full h-full max-h-[420px] object-contain drop-shadow-md transition-all duration-300 hover:scale-[1.01]"
            loading="eager"
          />
        </div>
      </div>

      {/* Bottom Subtle Tagline */}
      <div className="relative z-10 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
        <span>Forkora Pathway Platform</span>
        <span>Empowering Ambitions</span>
      </div>
    </div>
  )
}
