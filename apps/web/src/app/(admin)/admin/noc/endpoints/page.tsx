// /admin/noc/endpoints — flat grid of every managed endpoint across clients.

import Link from 'next/link'
import {
  Cpu,
  Server,
  Smartphone,
  Wifi,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { NOC_ENDPOINTS } from '@/server/noc-stubs'

const KIND_ICON: Record<string, React.ElementType> = {
  workstation: Cpu,
  server: Server,
  mobile: Smartphone,
  network_device: Wifi,
  virtual: Server,
  other: Cpu,
}

export default function NocEndpointsPage() {
  return (
    <div className="max-w-[1400px] space-y-6">
      <AdminPageHeader
        eyebrow="NOC · Fleet"
        title="Managed endpoints"
        description="Every device under active monitoring. Filter by client or status. Click into an endpoint for its full check history and runbook stack."
        breadcrumbs={[{ label: 'Admin' }, { label: 'NOC', href: '/admin/noc' }, { label: 'Endpoints' }]}
        primaryAction={{ label: 'Configurator', href: '/admin/noc/configurator' }}
        secondaryAction={{ label: 'Console', href: '/admin/noc' }}
      />

      <AdminCard eyebrow="Live grid" title={`${NOC_ENDPOINTS.length} endpoints`} flush>
        <table className="w-full">
          <thead>
            <tr className="bg-[#F4F8F7] border-b border-[#D5E0DE]">
              <Th>Hostname</Th>
              <Th>Client</Th>
              <Th>Kind / OS</Th>
              <Th>Status</Th>
              <Th>Pass · Warn · Fail</Th>
              <Th>Last heartbeat</Th>
              <Th>Agent</Th>
              <Th>Tags</Th>
            </tr>
          </thead>
          <tbody>
            {NOC_ENDPOINTS.map((e, i) => {
              const Icon = KIND_ICON[e.kind] ?? Cpu
              return (
                <tr
                  key={e.id}
                  className={`hover:bg-[#F4F8F7]/60 transition-colors ${i < NOC_ENDPOINTS.length - 1 ? 'border-b border-[#E5EDEB]' : ''}`}
                >
                  <Td>
                    <Link
                      href={`/admin/noc/endpoints/${e.id}` as never}
                      className="inline-flex items-center gap-2 font-mono text-[12px] font-semibold text-[#0F4C4C] hover:text-[#082F2F]"
                    >
                      <Icon className="w-3.5 h-3.5 text-[#0F766E]" />
                      {e.hostname}
                    </Link>
                  </Td>
                  <Td>
                    <span className="text-[12.5px] text-[#0F4C4C]">{e.clientName}</span>
                  </Td>
                  <Td>
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#5F6E6D]">
                      {e.kind.replace('_', ' ')} · {e.osFamily} {e.osVersion ?? ''}
                    </span>
                  </Td>
                  <Td>
                    <StatusPill status={e.status} />
                  </Td>
                  <Td>
                    <span className="font-mono text-[11px] text-[#5F6E6D]">
                      <span className="text-[#0F766E]">{e.passCount}</span> ·{' '}
                      <span className="text-amber-600">{e.warnCount}</span> ·{' '}
                      <span className="text-red-600">{e.failCount}</span>
                    </span>
                  </Td>
                  <Td>
                    <span className="font-mono text-[11px] text-[#5F6E6D]">
                      {fmtAgo(e.lastHeartbeatAt)}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-mono text-[10.5px] text-[#5F6E6D]">v{e.agentVersion}</span>
                  </Td>
                  <Td>
                    <div className="flex gap-1 flex-wrap">
                      {e.tags.map((t) => (
                        <span
                          key={t}
                          className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#0F4C4C] bg-[#ECFEFE] border border-[#CFFAFA] px-1.5 py-0.5 rounded-[2px]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </AdminCard>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-6 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] font-medium">
      {children}
    </th>
  )
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-6 py-3.5">{children}</td>
}

function StatusPill({
  status,
}: {
  status: 'healthy' | 'warning' | 'critical' | 'offline' | 'unenrolled'
}) {
  const cfg = {
    healthy: { bg: 'bg-[#ECFEFE]', text: 'text-[#0F4C4C]', border: 'border-[#CFFAFA]', icon: CheckCircle2, label: 'Healthy' },
    warning: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', icon: AlertTriangle, label: 'Warning' },
    critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100', icon: ShieldAlert, label: 'Critical' },
    offline: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', icon: Wifi, label: 'Offline' },
    unenrolled: { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200', icon: Cpu, label: 'Unenrolled' },
  } as const
  const c = cfg[status]
  const Icon = c.icon
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] px-2 py-1 rounded-[3px] border ${c.bg} ${c.text} ${c.border}`}
    >
      <Icon className="w-3 h-3" />
      {c.label}
    </span>
  )
}

function fmtAgo(iso?: string): string {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
