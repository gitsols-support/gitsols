import Link from 'next/link'
import { cn } from '@gitsols/utils'

type ButtonVariant = 'primary' | 'accent' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md'

interface ButtonBaseProps {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: React.ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[#0F4C4C] text-white hover:bg-[#155E5E] active:bg-[#0A3A3A]',
  accent: 'bg-[#14B8A6] text-white hover:bg-[#0D9488] active:bg-[#0F766E]',
  ghost: 'border border-[#E2E8E8] text-[#0F4C4C] hover:bg-gray-50',
  danger: 'border border-red-200 text-red-600 hover:bg-red-50',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-xs px-3 py-1.5 rounded-lg',
  md: 'text-sm px-4 py-2 rounded-xl',
}

interface ButtonProps extends ButtonBaseProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> {}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

interface LinkButtonProps extends ButtonBaseProps {
  href: string
}

export function LinkButton({
  href,
  variant = 'primary',
  size = 'md',
  className,
  children,
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-colors',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </Link>
  )
}
