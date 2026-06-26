import { cn } from '@gitsols/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  delta?: number
  deltaLabel?: string
  icon?: React.ElementType
  className?: string
}

export function StatCard({ label, value, delta, deltaLabel, icon: Icon, className }: StatCardProps) {
  const deltaPositive = (delta ?? 0) >= 0
  return (
    <div className={cn('bg-white rounded-xl border border-[#E2E8E8] p-5', className)}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#14B8A6]/80">
          {label}
        </p>
        {Icon && (
          <div className="w-7 h-7 rounded-lg bg-[#0F4C4C]/5 flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 text-[#0F4C4C]/70" />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-[#0F4C4C] leading-none">{value}</p>
      {typeof delta === 'number' && (
        <div className="flex items-center gap-1.5 mt-2">
          {deltaPositive ? (
            <TrendingUp className="w-3 h-3 text-[#14B8A6]" />
          ) : (
            <TrendingDown className="w-3 h-3 text-[#EF4444]" />
          )}
          <span
            className={cn(
              'text-[11px] font-semibold',
              deltaPositive ? 'text-[#14B8A6]' : 'text-[#EF4444]',
            )}
          >
            {deltaPositive ? '+' : ''}
            {delta}%
          </span>
          {deltaLabel && (
            <span className="text-[11px] text-gray-400">{deltaLabel}</span>
          )}
        </div>
      )}
    </div>
  )
}
