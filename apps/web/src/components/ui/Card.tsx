import { cn } from '@gitsols/utils'

type CardVariant = 'standard' | 'large' | 'elevated' | 'urgent'

interface CardProps {
  variant?: CardVariant
  className?: string
  children: React.ReactNode
}

const variantClasses: Record<CardVariant, string> = {
  standard: 'bg-white rounded-xl border border-[#E2E8E8]',
  large: 'bg-white rounded-2xl border border-[#E2E8E8]',
  elevated: 'bg-white rounded-xl shadow-sm border border-[#E2E8E8]',
  urgent: 'bg-amber-50 rounded-xl border border-amber-200',
}

export function Card({ variant = 'standard', className, children }: CardProps) {
  return <div className={cn(variantClasses[variant], className)}>{children}</div>
}
