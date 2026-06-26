import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Clock,
  Search,
  ShieldCheck,
  ClipboardList,
  CheckCircle2,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react'
import { COMPANY } from '@gitsols/constants'
import LeadForm from '@/components/marketing/LeadForm'
import Cta from '@/components/marketing/Cta'
import PageHero from '@/components/marketing/PageHero'
import SectionLabel from '@/components/marketing/SectionLabel'

export const metadata: Metadata = {
  title: 'Free IT Audit — 60-minute review of your environment',
  description:
    'GITSOLS will review your network, endpoints, backup posture, and compliance gaps in 60 minutes. You get a written punch list. Yours to keep, no obligation.',
  alternates: { canonical: '/free-it-audit' },
}

const AUDIT_STEPS: { title: string; body: string; icon: LucideIcon }[] = [
  {
    title: 'Network & endpoints',
    body: 'Switch and Wi-Fi visibility, patch posture, EDR coverage, asset inventory.',
    icon: Search,
  },
  {
    title: 'Identity & access',
    body: 'M365 / Google Workspace config, MFA coverage, conditional access, privileged accounts.',
    icon: ShieldCheck,
  },
  {
    title: 'Backup & recovery',
    body: 'What is backed up, where, and how often you have actually tested a restore.',
    icon: ClipboardList,
  },
  {
    title: 'Compliance posture',
    body: 'Mapping current controls against your framework (HIPAA / SOC 2 / NYDFS / NIST).',
    icon: CheckCircle2,
  },
]

const WHATS_INCLUDED = [
  'Written findings report — yours to keep',
  'Risk-ranked punch list (high / medium / low)',
  'Estimated effort for the top 3 fixes',
  'No sales pitch unless you ask for one',
]

export default function FreeAuditPage() {
  return (
    <>
      <PageHero
        eyebrow="The complimentary audit"
        title={
          <>
            Sixty minutes. Written findings.
            <br />
            <span className="text-[#14B8A6]">Yours to keep.</span>
          </>
        }
        subtitle="We review your environment with you on a video call. You leave with a written findings document — a risk-ranked punch list and estimated effort for the top fixes. Yours, regardless of whether the next call ever happens."
        cta={
          <Link
            href="/free-it-audit/intake"
            className="group inline-flex items-center gap-2 bg-white hover:bg-[#F4F8F7] text-[#062524] text-[13.5px] font-semibold pl-5 pr-4 py-3.5 rounded-[3px] transition-colors"
          >
            Begin intake
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        }
        trust={[
          { label: '60 minutes' },
          { label: 'No obligation' },
          { label: 'Punch list yours to keep' },
        ]}
      />

      {/* ════════════════════════════════════════════════
          INTAKE CTA — detail card + simple-form fallback
          ════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-[#D5E0DE]">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:items-start">
            <div className="relative bg-white border border-[#D5E0DE] rounded-[4px] p-7 overflow-hidden shadow-[0_24px_60px_-30px_rgba(8,47,47,0.20)]">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#0F766E] via-[#0F4C4C] to-[#0F766E]" />
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F4C4C]">
                Begin the intake
              </p>
              <h2
                className="mt-3 font-serif text-[28px] text-[#0F4C4C] leading-tight tracking-[-0.012em]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Four short questions. A preview portal at the end.
              </h2>
              <p className="mt-4 text-[13.5px] text-[#5F6E6D] leading-relaxed">
                Tell us a little about your environment and what&apos;s prompting
                this. Each answer becomes one less question on the audit call.
              </p>
              <Link
                href="/free-it-audit/intake"
                className="mt-6 group inline-flex items-center justify-between gap-2 bg-[#0F4C4C] hover:bg-[#082F2F] text-white text-[13.5px] font-semibold pl-5 pr-4 py-3.5 rounded-[3px] transition-colors border border-[#082F2F] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] w-full"
              >
                Begin intake
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>

              <div className="mt-5 pt-5 border-t border-dotted border-[#D5E0DE]">
                <div className="flex items-center gap-2 font-mono text-[11.5px] uppercase tracking-[0.18em] text-[#5F6E6D]">
                  <Clock className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>About three minutes · Pick windows that fit · Preview at the end</span>
                </div>
              </div>
            </div>

            <div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 list-rule">
                {WHATS_INCLUDED.map((p) => (
                  <li key={p} className="text-[13.5px] text-[#062524]/80 leading-relaxed">
                    {p}
                  </li>
                ))}
              </ul>

              <details className="mt-7 group">
                <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.22em] text-[#5F6E6D] hover:text-[#0F4C4C] inline-flex items-center gap-1.5">
                  Or send a simple message <span aria-hidden>+</span>
                </summary>
                <div className="mt-4">
                  <LeadForm
                    source="free_it_audit"
                    heading="Send a message instead"
                    body="We respond within one business day."
                    submitLabel="Send"
                    showIndustry
                    compact
                  />
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          AUDIT AREAS
          ════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-[#D5E0DE]">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-14">
            <div className="lg:col-span-4">
              <SectionLabel numeral={1} rule>
                What we cover
              </SectionLabel>
              <h2
                className="mt-5 font-serif text-[#0F4C4C] leading-[1.04] tracking-[-0.018em]"
                style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)' }}
              >
                Four areas.
                <br />
                <span className="italic">Every audit, every time.</span>
              </h2>
              <hr className="rule-brass mt-7 max-w-[120px]" />
              <p className="mt-6 text-[14.5px] text-[#5F6E6D] leading-relaxed max-w-md">
                The same playbook we use on day one of every engagement. If we
                fit, you already have the start of an SoW.
              </p>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-5">
              {AUDIT_STEPS.map((s, i) => {
                const Icon = s.icon
                return (
                  <article
                    key={s.title}
                    className="relative bg-white rounded-[4px] border border-[#D5E0DE] p-6 overflow-hidden hover:border-[#0F4C4C]/40 hover:shadow-[0_24px_40px_-20px_rgba(8,47,47,0.18)] transition-all"
                  >
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#0F766E]/40" />
                    <div className="flex items-baseline justify-between gap-3 mb-5">
                      <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#0F4C4C]">
                        № 0{i + 1}
                      </span>
                      <div className="w-10 h-10 rounded-[3px] bg-[#F4F8F7] border border-[#D5E0DE] flex items-center justify-center">
                        <Icon className="w-4 h-4 text-[#0F4C4C]" />
                      </div>
                    </div>
                    <h3
                      className="font-serif text-[22px] text-[#0F4C4C] leading-tight tracking-[-0.01em]"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      {s.title}
                    </h3>
                    <p className="mt-3 text-[13.5px] text-[#5F6E6D] leading-relaxed">{s.body}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <Cta
        label="Or by telephone"
        heading={
          <>
            Prefer to start with a call?
            <br />
            <span className="italic text-[#0F766E]">{COMPANY.phone} — we&apos;ll pick up.</span>
          </>
        }
        body="Business hours for new inquiries. After-hours line is reserved for current clients with active incidents."
        primaryLabel="Or send a message"
        primaryHref="/contact"
        showPhone={false}
      />
    </>
  )
}
