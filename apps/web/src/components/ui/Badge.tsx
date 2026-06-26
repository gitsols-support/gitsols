import { cn } from '@gitsols/utils'

type BadgeVariant = 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'neutral'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-[#0F4C4C] text-white',
  accent: 'bg-[#F0FDFA] text-[#14B8A6] border border-[#14B8A6]/25',
  success: 'bg-green-50 text-green-700 border border-green-200',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  error: 'bg-red-50 text-red-600 border border-red-200',
  info: 'bg-blue-50 text-blue-600 border border-blue-200',
  neutral: 'bg-gray-100 text-gray-600 border border-gray-200',
}

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center text-xs font-medium rounded-lg px-2 py-0.5',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function CountBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 rounded-full bg-[#14B8A6] text-white text-[9px] font-bold px-1">
      {count}
    </span>
  )
}
