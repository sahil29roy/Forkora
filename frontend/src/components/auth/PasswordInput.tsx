import * as React from 'react'
import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { Input, type InputProps } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  showToggle?: boolean
  showLeftIcon?: boolean
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showToggle = true, showLeftIcon = true, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    return (
      <div className="relative flex items-center">
        {showLeftIcon && (
          <div className="pointer-events-none absolute left-3.5 flex items-center justify-center text-muted">
            <Lock className="h-4 w-4 stroke-[1.8]" />
          </div>
        )}
        <Input
          type={showPassword ? 'text' : 'password'}
          className={cn(showLeftIcon && 'pl-10', showToggle && 'pr-10', className)}
          ref={ref}
          {...props}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-0 top-0 flex h-11 w-10 items-center justify-center text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-r-lg transition-colors"
            tabIndex={0}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 stroke-[1.8]" />
            ) : (
              <Eye className="h-4 w-4 stroke-[1.8]" />
            )}
          </button>
        )}
      </div>
    )
  }
)
PasswordInput.displayName = 'PasswordInput'

export { PasswordInput }
