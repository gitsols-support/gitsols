// /admin/noc/configurator — landing page for the NOC configurator.
//
// Lists every client with a quick rollup, plus the full check catalog.
// Selecting a client deep-links to /admin/noc/configurator/[clientId]
// where the actual per-check enable/disable + threshold overrides happen.

import Link from 'next/link'
import {
  Settings,
  ShieldCheck,
  Lock,
  Activity,
  Wifi,
  Database,
  RadioTower,
  ArrowUpRight,
  Boxes,
  KeyRound,
  ClipboardList,
} from 'lucide-react'
import {
  NOC_CHECK_CATALOG,
  NOC_CATEGORY_LABELS,
  NOC_CATEGORY_BLURBS,
} from '@gitsols/constants'
import type { NocCheckCategory } from '@gitsols/types'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { NOC_CLIENTS } from '@/server/noc-stubs'

const CATEGORY_ICON: Record<NocCheckCategory, React.ElementType> = {
  encryption: Lock,
  patching: Activity,
  identity: KeyRound,
  edr_av: ShieldCheck,
  backup: Database,
  network: Wifi,
  lob_app: Boxes,
  compliance: ClipboardList,
  inventory: Boxes,
  custom: Settings,
}

export default function NocConfiguratorIndex() {
  const byCategory = NOC_CHECK_CATALOG.reduce<Record<string, typeof NOC_CHECK_CATALOG>>(
    (acc, c) => {
      ;(acc[c.category] ??= []).push(c)
      return acc
    },
    {},
  )

  return (
    <div className="max-w-[1400px] space-y-6">
      <AdminPageHeader
        eyebrow="NOC · Configuration"
        title="NOC configurator"
        description="Choose a client to scope which checks run, at what severity, on what schedule — and which runbook attaches to each. Per-client overrides ship to the agent on its next heartbeat."
        breadcrumbs={[{ label: 'Admin' }, { label: 'NOC', href: '/admin/noc' }, { label: 'Configurator' }]}
        primaryAction={{ label: 'Console', href: '/admin/noc', icon: RadioTower }}
        secondaryAction={{ label: 'Runbook library', href: '/admin/noc/runbooks' }}
      />

      {/* Per-client list */}
      <AdminCard
        eyebrow="Step 1"
        title="Pick a client to configure"
        description="Each client has its own check set. Overrides ship to the agent on its next tick (max 60-minute propagation)."
        flush
      >
        <ul>
          {NOC_CLIENTS.map((c, i) => (
            <li
              key={c.id}
              className={`flex items-center justify-between px-6 py-4 hover:bg-[#F4F8F7]/60 transition-colors ${i < NOC_CLIENTS.length - 1 ? 'border-b border-[#E5EDEB]' : ''}`}
            >
              <Link
                href={`/admin/noc/configurator/${c.id}`}
                className="flex items-center gap-4 flex-1 min-w-0"
              >
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-[3px] bg-[#F4F8F7] border border-[#D5E0DE] font-serif text-[15px] text-[#0F4C4C]" style={{ fontFamily: 'var(--font-serif)' }}>
                  {c.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-[#0F4C4C] truncate">{c.name}</p>
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#5F6E6D]">
                    {c.industry.replace(/-/g, ' ')} · {c.endpointCount} endpoints
                  </p>
                </div>
              </Link>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] px-2 py-1 rounded-[3px] border ${
                    c.status === 'healthy'
                      ? 'bg-[#ECFEFE] text-[#0F4C4C] border-[#CFFAFA]'
                      : c.status === 'warning'
                        ? 'bg-amber-50 text-amber-700 border-amber-100'
                        : 'bg-red-50 text-red-700 border-red-100'
                  }`}
                >
                  {c.status}
                </span>
                <ArrowUpRight className="w-4 h-4 text-[#5F6E6D]" />
              </div>
            </li>
          ))}
        </ul>
      </AdminCard>

      {/* Catalog by category */}
      <AdminCard
        eyebrow="Step 2 · Reference"
        title="Built-in check catalog"
        description="The full set of checks that ship with the GITSOLS agent. Each one is osquery- or shell-backed, mapped to a HIPAA control where applicable, and has a default runbook."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {Object.entries(byCategory).map(([cat, items]) => {
            const Icon = CATEGORY_ICON[cat as NocCheckCategory] ?? Settings
            return (
              <section key={cat}>
                <header className="flex items-center gap-2.5 mb-3 pb-2 border-b border-[#E5EDEB]">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-[3px] bg-[#F4F8F7] border border-[#D5E0DE]">
                    <Icon className="w-3.5 h-3.5 text-[#0F4C4C]" />
                  </span>
                  <div>
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#0F766E]">
                      {NOC_CATEGORY_LABELS[cat as NocCheckCategory]}
                    </p>
                    <p className="text-[11.5px] text-[#5F6E6D] leading-tight mt-0.5">
                      {NOC_CATEGORY_BLURBS[cat as NocCheckCategory]}
                    </p>
                  </div>
                </header>
                <ul className="space-y-1.5">
                  {items.map((c) => (
                    <li key={c.slug} className="flex items-start gap-2.5">
                      <SeverityDot severity={c.defaultSeverity} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-semibold text-[#0F4C4C] leading-tight">{c.name}</p>
                        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#5F6E6D] mt-0.5">
                          {c.slug}
                          {c.hipaaControl && (
                            <>
                              <span className="text-[#D5E0DE] mx-1.5">·</span>
                              <span className="text-[#0F766E]">HIPAA {c.hipaaControl}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      </AdminCard>
    </div>
  )
}

function SeverityDot({ severity }: { severity: 'info' | 'warn' | 'critical' }) {
  const c =
    severity === 'critical' ? 'bg-red-500' : severity === 'warn' ? 'bg-amber-500' : 'bg-[#14B8A6]'
  return <span className={`inline-block w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${c}`} />
}
