// /admin/noc/runbooks — NOC runbook library.
//
// Implementation + troubleshooting guides per check / category / client.
// Global runbooks ship with the platform; client-specific overrides live
// in `noc_runbooks` with a `clientId`. Client-visible runbooks render in
// the portal at /portal/noc/runbooks.

import Link from 'next/link'
import {
  ClipboardList,
  Lock,
  Activity,
  KeyRound,
  ShieldCheck,
  Database,
  Wifi,
  Boxes,
  Settings,
  Plus,
  Eye,
  EyeOff,
  Users,
} from 'lucide-react'
import { NOC_CATEGORY_LABELS, NOC_DEFAULT_RUNBOOKS } from '@gitsols/constants'
import type { NocCheckCategory } from '@gitsols/types'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { NOC_RUNBOOK_LIBRARY } from '@/server/noc-stubs'

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

export default function NocRunbookLibrary() {
  // Group the default runbook seeds by category.
  const grouped = NOC_DEFAULT_RUNBOOKS.reduce<Record<string, typeof NOC_DEFAULT_RUNBOOKS>>(
    (acc, r) => {
      ;(acc[r.category] ??= []).push(r)
      return acc
    },
    {},
  )

  // Live (authored) runbooks from the stub.
  const authored = new Set(NOC_RUNBOOK_LIBRARY.map((r) => r.slug))

  return (
    <div className="max-w-[1400px] space-y-6">
      <AdminPageHeader
        eyebrow="NOC · Knowledge"
        title="Runbook library"
        description="Implementation and troubleshooting guides. Each check has a default runbook; clients can override with their own. Mark as client-visible to expose on the client portal."
        breadcrumbs={[{ label: 'Admin' }, { label: 'NOC', href: '/admin/noc' }, { label: 'Runbooks' }]}
        primaryAction={{ label: 'New runbook', href: '/admin/noc/runbooks/new' as never, icon: Plus }}
        secondaryAction={{ label: 'Configurator', href: '/admin/noc/configurator' }}
      />

      {/* Recently authored */}
      <AdminCard
        eyebrow="Recently authored"
        title={`${NOC_RUNBOOK_LIBRARY.length} authored runbooks`}
        flush
      >
        <ul>
          {NOC_RUNBOOK_LIBRARY.map((r, i) => (
            <li
              key={r.id}
              className={`flex items-center justify-between px-6 py-4 hover:bg-[#F4F8F7]/60 transition-colors ${i < NOC_RUNBOOK_LIBRARY.length - 1 ? 'border-b border-[#E5EDEB]' : ''}`}
            >
              <Link
                href={`/admin/noc/runbooks/${r.slug}`}
                className="flex items-start gap-4 flex-1 min-w-0"
              >
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-[3px] bg-[#F4F8F7] border border-[#D5E0DE] flex-shrink-0">
                  {(() => {
                    const Icon = r.category ? (CATEGORY_ICON[r.category] ?? Settings) : Settings
                    return <Icon className="w-3.5 h-3.5 text-[#0F4C4C]" />
                  })()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-semibold text-[#0F4C4C] truncate">{r.title}</p>
                  <p className="text-[12px] text-[#5F6E6D] mt-0.5 line-clamp-1">{r.summary}</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#0F766E] mt-1">
                    {r.slug} · v{r.currentVersion} ·{' '}
                    {r.category ? NOC_CATEGORY_LABELS[r.category] : 'general'}
                  </p>
                </div>
              </Link>
              <AudiencePill audience={r.audience} />
            </li>
          ))}
        </ul>
      </AdminCard>

      {/* Default catalog by category */}
      <AdminCard
        eyebrow="Defaults"
        title="Default runbook catalog"
        description="Every built-in check ships with a runbook slug. Author the body once and it auto-attaches to every alert that opens for that check."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
          {Object.entries(grouped).map(([cat, items]) => {
            const Icon = CATEGORY_ICON[cat as NocCheckCategory] ?? Settings
            return (
              <section key={cat}>
                <header className="flex items-center gap-2.5 mb-3 pb-2 border-b border-[#E5EDEB]">
                  <Icon className="w-3.5 h-3.5 text-[#0F4C4C]" />
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#0F766E]">
                    {NOC_CATEGORY_LABELS[cat as NocCheckCategory]}
                  </p>
                </header>
                <ul className="space-y-1.5">
                  {items.map((r) => {
                    const exists = authored.has(r.slug)
                    return (
                      <li key={r.slug} className="flex items-start gap-2">
                        <span
                          className={`inline-block w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${exists ? 'bg-[#14B8A6]' : 'bg-[#D5E0DE]'}`}
                        />
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/admin/noc/runbooks/${r.slug}`}
                            className="block text-[12.5px] font-semibold text-[#0F4C4C] hover:text-[#082F2F] leading-tight"
                          >
                            {r.title}
                          </Link>
                          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#5F6E6D] mt-0.5">
                            {r.slug} · {r.audience.replace('_', ' ')}
                          </p>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </div>
      </AdminCard>
    </div>
  )
}

function AudiencePill({
  audience,
}: {
  audience: 'internal' | 'client_visible' | 'both'
}) {
  const cfg = {
    internal: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', icon: EyeOff, label: 'Internal' },
    client_visible: { bg: 'bg-[#ECFEFE]', text: 'text-[#0F4C4C]', border: 'border-[#CFFAFA]', icon: Eye, label: 'Client' },
    both: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', icon: Users, label: 'Both' },
  } as const
  const c = cfg[audience]
  const Icon = c.icon
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] px-2 py-1 rounded-[3px] border ${c.bg} ${c.text} ${c.border} flex-shrink-0`}
    >
      <Icon className="w-3 h-3" />
      {c.label}
    </span>
  )
}
