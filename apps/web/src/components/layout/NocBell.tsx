'use client'

// Admin top-bar NOC bell.
//
// A dedicated radio-tower icon with a live alert count badge. Clicking it
// opens a compact dropdown showing the latest 5 open alerts and a CTA to
// open the full /admin/noc console. Wire it up in `AdminTopBar.tsx`.
//
// Phase 2 hits `/api/v1/noc/admin/rollup` + `/alerts` for live counts. For
// now it consumes a stub from `noc-stubs.ts` so the UI is paintable without
// the API being live.

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  RadioTower,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react'
import { cn } from '@gitsols/utils'
import { NOC_ROLLUP, NOC_ALERT_FEED } from '@/server/noc-stubs'

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'text-red-600 bg-red-50 border-red-100',
  warn: 'text-amber-700 bg-amber-50 border-amber-100',
  info: 'text-[#0F4C4C] bg-[#ECFEFE] border-[#CFFAFA]',
}

export default function NocBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click + Escape
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const openAlerts = NOC_ROLLUP.openAlerts
  const overallTone =
    NOC_ROLLUP.critical > 0
      ? 'critical'
      : NOC_ROLLUP.warning > 0
        ? 'warn'
        : 'healthy'
  const toneColor =
    overallTone === 'critical'
      ? 'bg-red-500'
      : overallTone === 'warn'
        ? 'bg-amber-500'
        : 'bg-[#14B8A6]'

  const latest = NOC_ALERT_FEED.slice(0, 5)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center relative transition-colors',
          open
            ? 'bg-[#0F4C4C] text-white'
            : 'text-gray-500 hover:bg-gray-100',
        )}
        aria-label="GITSOLS NOC"
        aria-expanded={open}
        title="GITSOLS NOC"
      >
        <RadioTower className="w-4 h-4" />
        {openAlerts > 0 && !open && (
          <span
            className={cn(
              'absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full text-white text-[9px] font-bold flex items-center justify-center',
              overallTone === 'critical' ? 'bg-red-500' : 'bg-amber-500',
            )}
          >
            {openAlerts > 9 ? '9+' : openAlerts}
          </span>
        )}
        {openAlerts === 0 && !open && (
          <span
            className={cn(
              'absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full',
              toneColor,
              'animate-pulse',
            )}
          />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-2xl border border-[#E2E8E8] shadow-xl z-50 overflow-hidden animate-fade-in">
          {/* Header — rollup */}
          <div className="px-4 pt-4 pb-3 bg-gradient-to-br from-[#0F4C4C] via-[#0A3A3A] to-[#082F2F] text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RadioTower className="w-4 h-4 text-[#14B8A6]" />
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#14B8A6]">
                  GITSOLS NOC
                </p>
              </div>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-[3px] border',
                  overallTone === 'critical'
                    ? 'bg-red-500/15 text-red-200 border-red-400/30'
                    : overallTone === 'warn'
                      ? 'bg-amber-500/15 text-amber-200 border-amber-400/30'
                      : 'bg-[#14B8A6]/15 text-[#14B8A6] border-[#14B8A6]/30',
                )}
              >
                <span className={cn('w-1.5 h-1.5 rounded-full', toneColor, 'animate-pulse')} />
                {overallTone === 'healthy' ? 'Nominal' : overallTone === 'warn' ? 'Degraded' : 'Critical'}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-1.5">
              <RollupCell label="Endpoints" value={NOC_ROLLUP.total} />
              <RollupCell label="Healthy" value={NOC_ROLLUP.healthy} tone="good" />
              <RollupCell label="Warning" value={NOC_ROLLUP.warning} tone="warn" />
              <RollupCell label="Critical" value={NOC_ROLLUP.critical} tone="bad" />
            </div>
          </div>

          {/* Alert feed */}
          <div className="max-h-[320px] overflow-y-auto">
            {latest.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-[#0F766E] mx-auto mb-2" />
                <p className="text-[13px] font-semibold text-[#0F4C4C]">
                  All clear
                </p>
                <p className="text-[11.5px] text-[#5F6E6D] mt-1">
                  No open alerts across the fleet.
                </p>
              </div>
            ) : (
              <ul>
                {latest.map((a, i) => (
                  <li
                    key={a.id}
                    className={cn(
                      'px-4 py-3 hover:bg-[#F4F8F7] transition-colors',
                      i < latest.length - 1 && 'border-b border-[#E5EDEB]',
                    )}
                  >
                    <Link
                      href={`/admin/noc/alerts/${a.id}` as never}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-2.5"
                    >
                      <span
                        className={cn(
                          'inline-flex items-center justify-center w-7 h-7 rounded-[3px] border flex-shrink-0',
                          SEVERITY_COLORS[a.severity],
                        )}
                      >
                        {a.severity === 'critical' ? (
                          <ShieldAlert className="w-3.5 h-3.5" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-semibold text-[#0F4C4C] leading-tight truncate">
                          {a.title}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#5F6E6D] truncate">
                          {a.endpointHostname} · {a.clientName}
                        </p>
                        <p className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#0F766E]">
                          {a.timeAgo}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-[#E2E8E8] bg-[#F8FAFA] px-4 py-3 flex items-center justify-between">
            <Link
              href="/admin/noc"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#0F4C4C] hover:text-[#082F2F]"
            >
              Open NOC console <ArrowUpRight className="w-3 h-3" />
            </Link>
            <Link
              href="/admin/noc/runbooks"
              onClick={() => setOpen(false)}
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#5F6E6D] hover:text-[#0F4C4C]"
            >
              Runbooks →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function RollupCell({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: number
  tone?: 'default' | 'good' | 'warn' | 'bad'
}) {
  const toneColor =
    tone === 'good'
      ? 'text-[#14B8A6]'
      : tone === 'warn'
        ? 'text-amber-300'
        : tone === 'bad'
          ? 'text-red-300'
          : 'text-white'
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-[3px] px-2 py-1.5">
      <p className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-white/50 truncate">
        {label}
      </p>
      <p className={cn('mt-0.5 font-serif text-[18px] leading-none', toneColor)}>
        {value}
      </p>
    </div>
  )
}
