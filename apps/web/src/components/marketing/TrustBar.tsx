import {
  ShieldCheck,
  ScrollText,
  Lock,
  Landmark,
  Cloud,
  Server,
  Mail,
  Building2,
  type LucideIcon,
} from 'lucide-react'

interface TrustBarProps {
  tone?: 'light' | 'dark'
  compact?: boolean
}

const COMPLIANCE = [
  { icon: ShieldCheck, label: 'HIPAA Security Rule' },
  { icon: ScrollText, label: 'SOC 2 Type II' },
  { icon: Lock, label: 'NIST CSF + 800-171' },
  { icon: Landmark, label: 'NYDFS 23 NYCRR 500' },
] as const

const PARTNERS = [
  { icon: Building2, label: 'Microsoft 365 Partner' },
  { icon: Cloud, label: 'Microsoft Azure' },
  { icon: Server, label: 'AWS' },
  { icon: Mail, label: 'Google Workspace' },
] as const

/**
 * Editorial trust strip — labeled rails with brass hairlines, monospace
 * column heads, and serif italic separators.
 */
export default function TrustBar({ tone = 'light', compact = false }: TrustBarProps) {
  return (
    <div className="space-y-7">
      <BadgeRail label="Frameworks operated under" items={COMPLIANCE} tone={tone} />
      {!compact && <BadgeRail label="Platforms supported" items={PARTNERS} tone={tone} />}
    </div>
  )
}

interface BadgeRailProps {
  label: string
  items: readonly { icon: LucideIcon; label: string }[]
  tone: 'light' | 'dark'
}

function BadgeRail({ label, items, tone }: BadgeRailProps) {
  const isDark = tone === 'dark'
  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
      <div className="flex items-center gap-3 lg:w-60 lg:flex-shrink-0">
        <span
          className={`font-mono text-[10px] uppercase tracking-[0.22em] whitespace-nowrap ${
            isDark ? 'text-[#0F766E]' : 'text-[#0F4C4C]'
          }`}
        >
          {label}
        </span>
        <span
          className={`hidden lg:block flex-1 h-px ${
            isDark ? 'bg-[#0F766E]/40' : 'bg-[#0F766E]/40'
          }`}
          aria-hidden
        />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {items.map((item) => (
          <Badge key={item.label} icon={item.icon} label={item.label} tone={tone} />
        ))}
      </div>
    </div>
  )
}

interface BadgeProps {
  icon: LucideIcon
  label: string
  tone: 'light' | 'dark'
}

function Badge({ icon: Icon, label, tone }: BadgeProps) {
  const isDark = tone === 'dark'
  return (
    <span
      className={
        isDark
          ? 'inline-flex items-center gap-1.5 text-[11.5px] font-medium text-white/85 bg-white/[0.04] border border-white/15 px-3 py-1.5 rounded-[3px]'
          : 'inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#0F4C4C] bg-white border border-[#D5E0DE] px-3 py-1.5 rounded-[3px]'
      }
    >
      <Icon className={`w-3.5 h-3.5 ${isDark ? 'text-[#0F766E]' : 'text-[#0F4C4C]/60'}`} />
      {label}
    </span>
  )
}
