import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/components/theme/ThemeProvider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ThemeSelectorProps {
  showLabel?: boolean
}

export function ThemeSelector({ showLabel = false }: ThemeSelectorProps) {
  const { theme, resolvedTheme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={showLabel ? 'default' : 'icon'}
          className="h-9 px-2.5 rounded-lg border-border bg-card hover:bg-muted/50 text-foreground transition-colors gap-2 text-xs font-medium"
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="h-4 w-4 text-accent transition-all duration-200" />
          ) : (
            <Sun className="h-4 w-4 text-amber-500 transition-all duration-200" />
          )}
          {showLabel && (
            <span className="capitalize">{theme}</span>
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 bg-card border-border shadow-lg z-50">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={`flex items-center gap-2 cursor-pointer text-xs ${
            theme === 'light' ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
          }`}
        >
          <Sun className="h-3.5 w-3.5 text-amber-500" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-2 cursor-pointer text-xs ${
            theme === 'dark' ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
          }`}
        >
          <Moon className="h-3.5 w-3.5 text-indigo-400" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className={`flex items-center gap-2 cursor-pointer text-xs ${
            theme === 'system' ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
          }`}
        >
          <Monitor className="h-3.5 w-3.5 text-muted" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
