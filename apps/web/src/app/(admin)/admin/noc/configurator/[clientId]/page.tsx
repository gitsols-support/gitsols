// /admin/noc/configurator/[clientId] — per-client check configurator.
//
// Phase 2 client component will POST to /api/v1/noc/admin/clients/:id/configs
// on toggle. Today this is a server-rendered preview with the form posture
// so the design and the catalog reads correctly against any selected client.

import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowUpRight,
  ClipboardList,
  Cpu,
  KeyRound,
  Settings,
  ShieldCheck,
  Lock,
  Activity,
  Wifi,
  Database,
  Boxes,
} from 'lucide-react'
import {
  NOC_CHECK_CATALOG,
  NOC_CATEGORY_LABELS,
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

interface PageProps {
  params: Promise<{ clientId: string }>
}

export default async function NocClientConfigurator({ params }: PageProps) {
  const { clientId } = await params
  const client = NOC_CLIENTS.find((c) => c.id === clientId)
  if (!client) notFound()

  // Group catalog by category for the editor panels.
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
        eyebrow={`Client · ${client.industry.replace(/-/g, ' ')}`}
        title={
          <>
            Configure NOC checks for
            <br />
            <span className="italic text-[#0F766E]">{client.name}.</span>
          </>
        }
        description={`${client.endpointCount} endpoints under monitoring. Toggle, override severity, or attach a custom runbook per check. Changes ship to the agent on next heartbeat.`}
        breadcrumbs={[
          { label: 'Admin' },
          { label: 'NOC', href: '/admin/noc' },
          { label: 'Configurator', href: '/admin/noc/configurator' },
          { label: client.name },
        ]}
        primaryAction={{
          label: 'Issue enrollment token',
          href: `/admin/noc/configurator/${clientId}/enroll` as never,
          icon: Cpu,
        }}
        secondaryAction={{ label: 'View endpoints', href: '/admin/noc/endpoints' }}
      />

      {/* Implementation guide */}
      <AdminCard
        eyebrow="Onboarding"
        title="Implementation guide"
        description="Walk this with the client's IT contact during kickoff. Each step references the per-OS install runbook."
      >
        <ol className="space-y-4">
          <Step
            n={1}
            title="Issue enrollment tokens"
            body="One token per endpoint. 60-minute TTL, single use. The token is the only secret the installer needs."
            link={{ label: 'Issue token', href: `/admin/noc/configurator/${clientId}/enroll` }}
          />
          <Step
            n={2}
            title="Deploy the agent"
            body="MSI / PKG / DEB installer. Use Intune (Windows), JAMF (macOS), or Ansible (Linux) for fleet rollout. Single-machine: run the installer interactively."
            link={{ label: 'Install runbook', href: '/admin/noc/runbooks/agent-install' }}
          />
          <Step
            n={3}
            title="Confirm enrollment"
            body="Endpoint appears on the Endpoints page within 90 seconds of first heartbeat. Status transitions unenrolled → healthy."
            link={{ label: 'Endpoints', href: '/admin/noc/endpoints' }}
          />
          <Step
            n={4}
            title="Tune checks for this client"
            body="Use the catalog below. Healthcare clients keep PHI-relevant defaults critical; marketing-only clients can demote backup severity."
          />
          <Step
            n={5}
            title="Attach client-specific runbooks"
            body="Anything LOB-specific (PMA, EMR, custom CRM) gets a per-client runbook so the on-call engineer doesn't have to dig."
            link={{ label: 'Runbook editor', href: '/admin/noc/runbooks/new' }}
          />
        </ol>
      </AdminCard>

      {/* Catalog editor by category */}
      {Object.entries(byCategory).map(([cat, items]) => {
        const Icon = CATEGORY_ICON[cat as NocCheckCategory] ?? Settings
        return (
          <AdminCard
            key={cat}
            eyebrow={`Category · ${cat}`}
            title={
              <span className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-[#0F4C4C]" />
                {NOC_CATEGORY_LABELS[cat as NocCheckCategory]}
              </span>
            }
            flush
          >
            <table className="w-full">
              <thead>
                <tr className="bg-[#F4F8F7] border-b border-[#D5E0DE]">
                  <Th>Check</Th>
                  <Th>Severity</Th>
                  <Th>Schedule</Th>
                  <Th>Runbook</Th>
                  <Th>Control</Th>
                  <Th>State</Th>
                </tr>
              </thead>
              <tbody>
                {items.map((c, i) => (
                  <tr
                    key={c.slug}
                    className={`hover:bg-[#F4F8F7]/40 transition-colors ${i < items.length - 1 ? 'border-b border-[#E5EDEB]' : ''}`}
                  >
                    <Td>
                      <p className="text-[13px] font-semibold text-[#0F4C4C] leading-tight">{c.name}</p>
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#5F6E6D] mt-0.5">
                        {c.slug}
                      </p>
                    </Td>
                    <Td>
                      <SeverityBadge severity={c.defaultSeverity} />
                    </Td>
                    <Td>
                      <span className="font-mono text-[11px] text-[#5F6E6D]">
                        {fmtMinutes(c.defaultScheduleMinutes)}
                      </span>
                    </Td>
                    <Td>
                      {c.defaultRunbookSlug ? (
                        <Link
                          href={`/admin/noc/runbooks/${c.defaultRunbookSlug}`}
                          className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#0F4C4C] hover:text-[#082F2F] underline decoration-dotted"
                        >
                          {c.defaultRunbookSlug} ↗
                        </Link>
                      ) : (
                        <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#D5E0DE]">none</span>
                      )}
                    </Td>
                    <Td>
                      {c.hipaaControl ? (
                        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#0F766E]">
                          HIPAA {c.hipaaControl}
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#D5E0DE]">—</span>
                      )}
                    </Td>
                    <Td>
                      <ToggleRow />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminCard>
        )
      })}

      {/* Custom check */}
      <AdminCard
        eyebrow="Per-client"
        title="Add a custom check"
        description="LOB-specific checks unique to this client. The agent runs them with the same osquery/shell harness as built-ins."
        action={
          <Link
            href={`/admin/noc/configurator/${clientId}/new-check` as never}
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#0F4C4C] hover:text-[#082F2F] inline-flex items-center gap-1"
          >
            New check <ArrowUpRight className="w-3 h-3" />
          </Link>
        }
      >
        <p className="text-[13px] text-[#5F6E6D] leading-relaxed">
          Examples in production: "PMA Practice Management is listening on
          {' '}<span className="font-mono text-[11.5px] text-[#0F4C4C]">tcp/443</span>",
          "Chart-room label printer responds to
          {' '}<span className="font-mono text-[11.5px] text-[#0F4C4C]">ping</span>",
          "EHR write share has &lt; 20% free space."
        </p>
      </AdminCard>
    </div>
  )
}

// ─── Inline sub-components ────────────────────────────────────────────────

function Step({
  n,
  title,
  body,
  link,
}: {
  n: number
  title: string
  body: string
  link?: { label: string; href: string }
}) {
  return (
    <li className="grid grid-cols-[44px_1fr_auto] gap-4 items-start">
      <span
        className="font-serif text-[26px] text-[#0F4C4C] leading-none tracking-[-0.02em]"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        {String(n).padStart(2, '0')}
      </span>
      <div>
        <p className="text-[14px] font-semibold text-[#0F4C4C] leading-tight">{title}</p>
        <p className="mt-1 text-[12.5px] text-[#5F6E6D] leading-relaxed">{body}</p>
      </div>
      {link && (
        <Link
          href={link.href as never}
          className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#0F4C4C] hover:text-[#082F2F] mt-1"
        >
          {link.label} <ArrowUpRight className="w-3 h-3" />
        </Link>
      )}
    </li>
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
  return <td className="px-6 py-3.5 align-top">{children}</td>
}

function SeverityBadge({ severity }: { severity: 'info' | 'warn' | 'critical' }) {
  const c: Record<string, string> = {
    info: 'bg-[#ECFEFE] text-[#0F4C4C] border-[#CFFAFA]',
    warn: 'bg-amber-50 text-amber-700 border-amber-100',
    critical: 'bg-red-50 text-red-700 border-red-100',
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] px-2 py-1 rounded-[3px] border ${c[severity]}`}
    >
      {severity}
    </span>
  )
}

function ToggleRow() {
  // Static rendering — the client-component editor swaps in a real toggle.
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#0F4C4C]">
      <span className="inline-block w-7 h-3.5 rounded-full bg-[#0F4C4C] relative">
        <span className="absolute right-0.5 top-0.5 w-2.5 h-2.5 rounded-full bg-white" />
      </span>
      Enabled
    </span>
  )
}

function fmtMinutes(m: number): string {
  if (m < 60) return `${m}m`
  if (m < 1440) return `${Math.round(m / 60)}h`
  return `${Math.round(m / 1440)}d`
}

// Pre-render all known clients.
export function generateStaticParams() {
  return NOC_CLIENTS.map((c) => ({ clientId: c.id }))
}

export const dynamic = 'force-static'
