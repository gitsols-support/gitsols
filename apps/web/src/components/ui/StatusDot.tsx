import { cn } from '@gitsols/utils'

type StatusDotKind = 'online' | 'warning' | 'error' | 'idle'

interface StatusDotProps {
  status: StatusDotKind
  pulse?: boolean
  className?: string
}

const colorMap: Record<StatusDotKind, string> = {
  online: 'bg-[#14B8A6]',
  warning: 'bg-[#F59E0B]',
  error: 'bg-[#EF4444]',
  idle: 'bg-gray-300',
}

export function StatusDot({ status, pulse = false, className }: StatusDotProps) {
  return (
    <span
      className={cn(
        'inline-block w-2 h-2 rounded-full',
        colorMap[status],
        pulse && 'animate-pulse',
        className,
      )}
    />
  )
}
