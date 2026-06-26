// Unauthenticated tokenized preview portal.
//
// Lives OUTSIDE the (marketing) route group so it doesn't inherit the
// marketing header/footer chrome. Has its own minimal chrome — this page
// reads as a "seed of a client portal," not as a marketing page.
//
// Server-component: fetches preview data from the Nest API by token.

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpRight,
  Phone,
  Mail,
  Clock4,
  CheckCircle2,
  ShieldCheck,
  ScrollText,
  Lock,
  Landmark,
  Cloud,
  Server,
  ClipboardList,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react'
import type { PreviewPortalData } from '@gitsols/types'
import { env } from '@/env'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params
  return {
    title: 'Your GITSOLS preview portal',
    robots: { index: false, follow: false },
    alternates: { canonical: `/preview/${token}` },
  }
}

async function fetchPreview(token: string): Promise<PreviewPortalData | null> {
  try {
    const res = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/preview/${encodeURIComponent(token)}`,
      { cache: 'no-store' },
    )
    if (!res.ok) return null
    return (await res.json()) as PreviewPortalData
  } catch {
    return null
  }
}

const FOCUS_ICON: Record<string, LucideIcon> = {
  ShieldCheck,
  ScrollText,
  Lock,
  Landmark,
  Cloud,
  Server,
  ClipboardList,
  AlertTriangle,
}

export default async function PreviewPortalPage({ params }: PageProps) {
  const { token } = await params
  const data = await fetchPreview(token)
  if (!data) notFound()

  return (
    <div className="min-h-screen bg-[#F4F8F7] text-[#062524]">
      {/* Top chrome — minimal portal masthead */}
      <header className="bg-[#082F2F] text-white border-b-2 border-[#0F766E]">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-[3px] bg-[#0F766E] flex items-center justify-center">
              <span className="font-serif text-[13px] text-[#082F2F] tracking-[-0.04em]" style={{ fontFamily: 'var(--font-serif)' }}>
                G.
              </span>
            </div>
            <div className="flex flex-col leading-none">
              <span
                className="font-serif text-[17px] tracking-[0.02em]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                GITSOLS
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#0F766E] mt-0.5">
                Preview portal · Read-only
              </span>
            </div>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">
            Expires {new Date(data.expiresAt).toISOString().slice(0, 10)}
          </div>
        </div>
      </header>

      {/* Hero — welcome with seal */}
      <section className="relative bg-white border-b border-[#D5E0DE] overflow-hidden">
        {/* Brass top rule */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#0F766E] to-transparent" />
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:items-start">
            <div className="lg:col-span-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F4C4C]">
                Step 1 of your engagement · Already started
              </p>
              <h1
                className="mt-4 font-serif text-4xl sm:text-5xl leading-[1.04] tracking-[-0.018em] text-[#0F4C4C]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Welcome, {data.prospect.firstName}.
              </h1>
              <p
                className="mt-4 font-serif italic text-[17px] text-[#5F6E6D] leading-relaxed max-w-xl"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                This is a preview built from what you told us about{' '}
                <span className="text-[#0F4C4C] not-italic font-semibold">{data.prospect.companyName}</span>.
                Some of what your client portal would look like if we work together —
                personalized, read-only, and yours to share.
              </p>

              <div className="mt-7 inline-flex items-center gap-2 px-3 py-1.5 rounded-[3px] bg-[#ECFEFE] border border-[#D5E0DE]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0F4C4C]" />
                <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#0F4C4C]">
                  Free IT audit · No obligation
                </span>
              </div>
            </div>

            {/* Audit logistics */}
            <AuditCard audit={data.audit} contact={data.directContact} />
          </div>
        </div>
      </section>

      {/* What we'd cover */}
      <Section eyebrow="What we will cover on the audit" title="Tailored from your answers.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {data.auditFocus.map((f) => {
            const Icon = FOCUS_ICON[f.icon] ?? ClipboardList
            return (
              <div
                key={f.title}
                className="relative bg-white border border-[#D5E0DE] rounded-[4px] p-7 overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#0F766E]/40" />
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-[3px] bg-[#F4F8F7] border border-[#D5E0DE] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#0F4C4C]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-serif text-[19px] leading-tight text-[#0F4C4C] tracking-[-0.01em]"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      {f.title}
                    </h3>
                    <p className="mt-2 text-[13.5px] text-[#5F6E6D] leading-relaxed">{f.body}</p>
                    {f.framework && (
                      <p className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#0F4C4C]">
                        {f.framework}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      {/* Engagement preview */}
      <Section
        eyebrow="Your engagement, in advance"
        title="A milestone preview, populated from the service template."
        body="If we work together, every milestone below shows up in your portal with status, evidence, and a one-click approval gate."
        tone="cream"
      >
        <ol className="relative">
          <div
            className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-[#0F766E]/0 via-[#0F766E]/55 to-[#0F766E]/0"
            aria-hidden
          />
          <div className="space-y-6">
            {data.engagementPreview.map((m) => (
              <li key={m.number} className="relative grid grid-cols-[44px_1fr] gap-4 items-start">
                <div className="relative z-10 w-10 h-10 rounded-full bg-white border border-[#D5E0DE] flex items-center justify-center shadow-[0_2px_0_rgba(15,118,110,0.25)]">
                  <span
                    className="font-serif text-[15px] text-[#0F4C4C] tracking-[-0.02em]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {String(m.number).padStart(2, '0')}
                  </span>
                </div>
                <div className="bg-white border border-[#D5E0DE] rounded-[4px] p-5 relative overflow-hidden">
                  {m.status === 'next' && (
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#0F766E]" />
                  )}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h3
                      className="font-serif text-[18px] text-[#0F4C4C] tracking-[-0.01em]"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      {m.title}
                    </h3>
                    <span
                      className={`font-mono text-[10px] uppercase tracking-[0.18em] ${
                        m.status === 'next' ? 'text-[#0F766E]' : 'text-[#5F6E6D]/70'
                      }`}
                    >
                      {m.status === 'next' ? 'Next step' : 'Upcoming'}
                      {m.eta && ` · ${m.eta}`}
                    </span>
                  </div>
                  <p className="mt-2 text-[13.5px] text-[#5F6E6D] leading-relaxed">
                    {m.description}
                  </p>
                </div>
              </li>
            ))}
          </div>
        </ol>
      </Section>

      {/* Matched case study */}
      {data.matchedCaseStudySlug && (
        <Section
          eyebrow="A real engagement at your scale"
          title="The closest case study from our archive."
        >
          <Link
            href={`/resources/case-studies/${data.matchedCaseStudySlug}`}
            className="group block bg-[#082F2F] text-white rounded-[4px] overflow-hidden relative"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#0F766E] via-[#CFFAFA] to-[#0F766E]" />
            <div className="absolute inset-0 bg-grid-dark opacity-[0.5] pointer-events-none" aria-hidden />
            <div className="relative p-10 grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
              <div className="lg:col-span-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F766E]">
                  Case study · Read in full
                </p>
                <h3
                  className="mt-3 font-serif text-[26px] leading-tight tracking-[-0.012em]"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  Modernizing a 50-provider medical group in 90 days
                </h3>
                <p className="mt-3 text-[13.5px] text-white/65 leading-relaxed max-w-xl">
                  Aging on-prem servers, weak access control, BAA gap with a recently-acquired
                  vendor. Seven milestones. Zero appointments lost.
                </p>
              </div>
              <div className="flex justify-start lg:justify-end">
                <span className="inline-flex items-center gap-1.5 bg-[#0F766E] hover:bg-[#CFFAFA] text-[#082F2F] text-[12.5px] font-semibold px-4 py-2.5 rounded-[3px] transition-colors">
                  Open case study
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </Link>
        </Section>
      )}

      {/* What you'll get back */}
      <Section
        eyebrow="What you take away"
        title="The audit ends with a written report — yours to keep."
        tone="cream"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              title: 'Risk-ranked punch list',
              body: 'High / medium / low findings — every finding tied to a control framework.',
            },
            {
              title: 'Effort estimates',
              body: 'Top 3 fixes scoped with rough effort + cost ranges so you can plan.',
            },
            {
              title: 'No follow-up unless asked',
              body: 'The report ships within two business days. We follow up only if you ask.',
            },
          ].map((c) => (
            <div
              key={c.title}
              className="relative bg-white border border-[#D5E0DE] rounded-[4px] p-7 overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#0F766E]/40" />
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#0F4C4C] mt-0.5 flex-shrink-0" />
                <div>
                  <h3
                    className="font-serif text-[18px] text-[#0F4C4C] tracking-[-0.01em]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {c.title}
                  </h3>
                  <p className="mt-2 text-[13.5px] text-[#5F6E6D] leading-relaxed">{c.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Direct line */}
      <section className="bg-[#082F2F] text-white border-t-2 border-[#0F766E]">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F766E]">
            Questions before the audit?
          </p>
          <div className="mt-3 grid grid-cols-1 lg:grid-cols-5 gap-8 items-end">
            <div className="lg:col-span-3">
              <h3
                className="font-serif text-[34px] leading-[1.08] tracking-[-0.015em]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Talk to the GITSOLS team.
              </h3>
              <p className="mt-3 font-serif text-[15px] text-white/55" style={{ fontFamily: 'var(--font-serif)' }}>
                A real engineer reads every prospect intake — and responds within one business day.
              </p>
            </div>
            <div className="lg:col-span-2 flex flex-col gap-3">
              <a
                href={`tel:${data.directContact.phone.replace(/\D/g, '')}`}
                className="inline-flex items-center justify-between gap-3 bg-[#0F766E] hover:bg-[#CFFAFA] text-[#082F2F] text-[13px] font-semibold px-5 py-3.5 rounded-[3px] transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" />
                  {data.directContact.phone}
                </span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${data.directContact.email}`}
                className="inline-flex items-center justify-between gap-3 border border-white/20 hover:border-[#0F766E] text-white text-[13px] font-semibold px-5 py-3.5 rounded-[3px] transition-colors"
              >
                <span className="inline-flex items-center gap-2 break-all">
                  <Mail className="w-3.5 h-3.5" />
                  {data.directContact.email}
                </span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer note */}
      <footer className="bg-[#F4F8F7] border-t border-[#D5E0DE]">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D]/75">
            This preview is personalized to {data.prospect.companyName} · Link expires{' '}
            {new Date(data.expiresAt).toISOString().slice(0, 10)}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] hover:text-[#0F4C4C]"
          >
            gitsols.com
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </footer>
    </div>
  )
}

// ─── Subcomponents ────────────────────────────────────────────────────

function AuditCard({
  audit,
  contact,
}: {
  audit: PreviewPortalData['audit']
  contact: PreviewPortalData['directContact']
}) {
  const statusLabel =
    audit.status === 'scheduled'
      ? 'Confirmed'
      : audit.status === 'completed'
        ? 'Completed'
        : 'Awaiting confirmation'

  return (
    <div className="relative bg-white border border-[#D5E0DE] rounded-[4px] p-6 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#0F766E] via-[#CFFAFA] to-[#0F766E]" />
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F4C4C]">
        Your audit
      </p>
      <p
        className="mt-2 font-serif text-[22px] text-[#0F4C4C] leading-tight tracking-[-0.01em]"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        {audit.scheduledFor
          ? new Date(audit.scheduledFor).toUTCString().slice(0, 22)
          : statusLabel}
      </p>
      <ul className="mt-4 space-y-2 text-[13px] text-[#5F6E6D]">
        <li className="inline-flex items-center gap-2">
          <Clock4 className="w-3.5 h-3.5 text-[#0F4C4C]" />
          {audit.durationMinutes} minute review
        </li>
        <li className="inline-flex items-center gap-2 break-all">
          <Phone className="w-3.5 h-3.5 text-[#0F4C4C]" />
          {contact.phone}
        </li>
        <li className="inline-flex items-center gap-2 break-all">
          <Mail className="w-3.5 h-3.5 text-[#0F4C4C]" />
          {contact.email}
        </li>
      </ul>

      {audit.requestedWindows && audit.requestedWindows.length > 0 && audit.status === 'requested' && (
        <div className="mt-5 pt-5 border-t border-[#E5EDEB]">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D]">
            Windows you offered
          </p>
          <ul className="mt-2 space-y-1.5 text-[12.5px] text-[#0F4C4C]">
            {audit.requestedWindows.slice(0, 3).map((iso) => (
              <li key={iso} className="font-mono">
                {new Date(iso).toUTCString().slice(0, 22)}
              </li>
            ))}
          </ul>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#0F4C4C]">
            We will confirm one within 1 business day.
          </p>
        </div>
      )}
    </div>
  )
}

function Section({
  eyebrow,
  title,
  body,
  tone = 'paper',
  children,
}: {
  eyebrow: string
  title: string
  body?: string
  tone?: 'paper' | 'cream'
  children: React.ReactNode
}) {
  return (
    <section className={tone === 'cream' ? 'bg-[#F4F8F7]' : 'bg-white'}>
      <div className="max-w-6xl mx-auto px-6 py-14 border-t border-[#D5E0DE]">
        <div className="mb-8 max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F4C4C]">
            {eyebrow}
          </p>
          <h2
            className="mt-3 font-serif text-[30px] sm:text-[34px] leading-[1.1] tracking-[-0.015em] text-[#0F4C4C]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {title}
          </h2>
          {body && <p className="mt-3 text-[14px] text-[#5F6E6D] leading-relaxed">{body}</p>}
        </div>
        {children}
      </div>
    </section>
  )
}
