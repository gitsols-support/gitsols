// /admin/noc/runbooks/[slug] — runbook viewer + edit-in-place link.
//
// Phase 2 will load `body_md` from `/api/v1/noc/admin/runbooks?slug=…`. Today
// the page renders a starter template for any slug not yet authored so the
// editor pattern is obvious and the URL space is complete.

import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  Edit3,
  Eye,
  EyeOff,
  Users,
  ClipboardList,
} from 'lucide-react'
import { NOC_CATEGORY_LABELS, NOC_DEFAULT_RUNBOOKS } from '@gitsols/constants'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { NOC_RUNBOOK_LIBRARY } from '@/server/noc-stubs'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function RunbookViewerPage({ params }: PageProps) {
  const { slug } = await params

  // Look up authored runbook first; fall back to default seed.
  const authored = NOC_RUNBOOK_LIBRARY.find((r) => r.slug === slug)
  const seed = NOC_DEFAULT_RUNBOOKS.find((r) => r.slug === slug)
  if (!authored && !seed) notFound()

  const title = authored?.title ?? seed?.title ?? slug
  const category = (authored?.category ?? seed?.category) as
    | keyof typeof NOC_CATEGORY_LABELS
    | undefined
  const audience = (authored?.audience ?? seed?.audience ?? 'internal') as
    | 'internal'
    | 'client_visible'
    | 'both'
  const version = authored?.currentVersion ?? 0

  const bodyMd = authored?.summary
    ? sampleBody(title, slug, audience)
    : starterTemplate(title, slug, category)

  return (
    <div className="max-w-[1100px] space-y-6">
      <AdminPageHeader
        eyebrow={`Runbook · ${category ? NOC_CATEGORY_LABELS[category] : 'General'}`}
        title={title}
        description={
          authored
            ? `Authored runbook · v${version}. Attached to alerts matching ${slug}.`
            : `Default runbook seed. No body authored yet — open the editor to write the first revision.`
        }
        breadcrumbs={[
          { label: 'Admin' },
          { label: 'NOC', href: '/admin/noc' },
          { label: 'Runbooks', href: '/admin/noc/runbooks' },
          { label: slug },
        ]}
        primaryAction={{
          label: authored ? 'Edit runbook' : 'Author runbook',
          href: `/admin/noc/runbooks/${slug}/edit` as never,
          icon: Edit3,
        }}
        secondaryAction={{ label: 'All runbooks', href: '/admin/noc/runbooks' }}
        badge={{
          label:
            audience === 'client_visible' ? 'Client visible' : audience === 'both' ? 'Both audiences' : 'Internal',
          tone: audience === 'internal' ? 'muted' : 'default',
        }}
      />

      <AdminCard
        eyebrow="Body"
        title="Markdown source · rendered"
        action={
          <Link
            href="/admin/noc/runbooks"
            className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.16em] text-[#5F6E6D] hover:text-[#0F4C4C]"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to library
          </Link>
        }
      >
        <article className="prose prose-sm max-w-none">
          {bodyMd.split('\n\n').map((para, i) => {
            const trimmed = para.trim()
            if (trimmed.startsWith('## ')) {
              return (
                <h3
                  key={i}
                  className="font-serif text-[18px] text-[#0F4C4C] tracking-[-0.012em] mt-6 mb-2 pb-2 border-b border-[#E5EDEB]"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {trimmed.slice(3)}
                </h3>
              )
            }
            if (trimmed.startsWith('### ')) {
              return (
                <h4
                  key={i}
                  className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#0F766E] mt-5 mb-1.5"
                >
                  {trimmed.slice(4)}
                </h4>
              )
            }
            if (trimmed.startsWith('```')) {
              return (
                <pre
                  key={i}
                  className="bg-[#062524] text-[#CFFAFA] font-mono text-[12px] p-4 rounded-[3px] overflow-x-auto my-4"
                >
                  {trimmed.replace(/^```\w*\n?|```$/g, '')}
                </pre>
              )
            }
            if (trimmed.startsWith('- ')) {
              const items = trimmed.split('\n').filter((l) => l.startsWith('- '))
              return (
                <ul key={i} className="my-3 space-y-1 text-[13.5px] text-[#5F6E6D]">
                  {items.map((l, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <span className="text-[#0F766E] mt-1.5">·</span>
                      <span>{l.slice(2)}</span>
                    </li>
                  ))}
                </ul>
              )
            }
            return (
              <p key={i} className="text-[13.5px] text-[#5F6E6D] leading-relaxed my-3">
                {trimmed}
              </p>
            )
          })}
        </article>
      </AdminCard>

      <AdminCard eyebrow="Meta" title="Audience & attachment">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Meta
            icon={ClipboardList}
            label="Slug"
            value={<span className="font-mono text-[12px] text-[#0F4C4C]">{slug}</span>}
          />
          <Meta
            icon={audience === 'internal' ? EyeOff : audience === 'client_visible' ? Eye : Users}
            label="Audience"
            value={
              <span className="text-[13px] text-[#0F4C4C]">
                {audience === 'internal'
                  ? 'Internal only'
                  : audience === 'client_visible'
                    ? 'Client portal'
                    : 'Both'}
              </span>
            }
          />
          <Meta
            icon={ClipboardList}
            label="Version"
            value={<span className="text-[13px] text-[#0F4C4C]">v{version || '—'}</span>}
          />
        </div>
      </AdminCard>
    </div>
  )
}

function Meta({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-[#F4F8F7] border border-[#D5E0DE] rounded-[3px]">
      <Icon className="w-4 h-4 text-[#0F4C4C] flex-shrink-0" />
      <div>
        <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-[#5F6E6D]">{label}</p>
        <p className="mt-0.5">{value}</p>
      </div>
    </div>
  )
}

// ─── Sample body content (rendered when slug is in authored set) ──────────

function sampleBody(title: string, slug: string, audience: string): string {
  return `## What this runbook covers

This runbook fires when the GITSOLS NOC observes the ${slug} check fail on a managed endpoint. It is rated ${audience.replace(
    '_',
    ' ',
  )} — ${
    audience === 'client_visible'
      ? 'safe to share with the client'
      : 'for internal engineer use only'
  }.

## Triage checklist

- Confirm the endpoint is reachable from the NOC heartbeat ingest in the last 5 minutes.
- Review the latest 3 heartbeats for context — flapping vs persistent.
- Open the configurator for the client and confirm the check is enabled at the expected severity.
- Cross-reference with adjacent checks in the same category for correlated failures.

## Resolution steps

### Immediate (under 5 minutes)

- Acknowledge the alert in the NOC console.
- If the endpoint is critical to client operations, file a P1 ticket linked to this alert.

### Standard (under 30 minutes)

- Reproduce the underlying check locally via the agent's debug mode.
- Apply the corrective action documented in the section below.
- Wait for the next heartbeat to confirm pass.

### Escalation

- If the check has failed 3+ ticks in a row after corrective action, escalate to the on-call engineer.
- Cross-link the corresponding ticket and update the client status page if the impact is user-visible.

## Underlying technical detail

The check resolves via osquery (or a category-specific probe). See the linked check definition in the configurator for the exact query, expected condition, and any client-side threshold overrides.

## Verification

- Latest result row in noc_endpoint_results transitions from fail → pass.
- noc_alerts row for this (endpoint, check) transitions to resolved automatically.
- No new alert opens within the next 24 hours of the same dedup key.
`
}

function starterTemplate(title: string, slug: string, category?: string): string {
  return `## Starter template — ${title}

This runbook has not been authored yet. Use the editor to flesh out:

- A one-sentence framing of when the check fires.
- A triage checklist the on-call engineer can scan in under a minute.
- The standard corrective action.
- The escalation path.
- A verification step the engineer can run to confirm resolution.

### Suggested category

${category ?? 'general'}

### Suggested check slug to attach

${slug}

### Reference

Cross-reference \`packages/constants/src/noc.ts\` for the check definition (osquery SQL, expected condition, HIPAA control mapping). This runbook auto-attaches to every alert that opens for the check with slug \`${slug}\`.
`
}

export const dynamic = 'force-static'

export function generateStaticParams() {
  // Pre-render every default runbook seed + every authored runbook.
  const slugs = new Set<string>()
  for (const r of NOC_DEFAULT_RUNBOOKS) slugs.add(r.slug)
  for (const r of NOC_RUNBOOK_LIBRARY) slugs.add(r.slug)
  return Array.from(slugs).map((slug) => ({ slug }))
}
