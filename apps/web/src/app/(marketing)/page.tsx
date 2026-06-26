import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowUpRight,
  ShieldCheck,
  Stethoscope,
  Landmark,
  Briefcase,
  CheckCircle2,
} from 'lucide-react'
import {
  SERVICES,
  INDUSTRIES,
  VALUE_PROPS,
  PROCESS_STAGES,
  COMPANY,
} from '@gitsols/constants'
import SectionLabel from '@/components/marketing/SectionLabel'
import ServiceCard from '@/components/marketing/ServiceCard'
import IndustryCard from '@/components/marketing/IndustryCard'
import StatRow from '@/components/marketing/StatRow'
import LeadForm from '@/components/marketing/LeadForm'
import Cta from '@/components/marketing/Cta'
import NetworkBackground from '@/components/marketing/NetworkBackground'
import TrustBar from '@/components/marketing/TrustBar'

export const metadata: Metadata = {
  title: 'GITSOLS — Managed IT, Cybersecurity & Bespoke Software',
  description:
    'New Jersey MSP for medical, financial, and professional services firms. 25+ years of managed IT, cybersecurity, HIPAA/SOC 2 compliance, and bespoke software development.',
}

const industryIcons = {
  healthcare: Stethoscope,
  'financial-services': Landmark,
  'professional-services': Briefcase,
} as const

const HERO_STAGES = PROCESS_STAGES.slice(0, 4)

export default function HomePage() {
  return (
    <>
      {/* ════════════════════════════════════════════════
          HERO — deep teal, matches admin sign-in panel
          ════════════════════════════════════════════════ */}
      <section className="relative min-h-[78vh] flex items-center overflow-hidden bg-[#0F4C4C] text-white">
        {/* Gradient base — same recipe as AuthShell */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F4C4C] via-[#0A3A3A] to-[#070F2C]" />
        {/* Radial accent washes */}
        <div
          className="absolute inset-0 opacity-25 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, #155E5E 0%, transparent 40%), radial-gradient(circle at 80% 70%, #14B8A6 0%, transparent 35%)',
          }}
          aria-hidden
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
          aria-hidden
        />
        {/* Subtle network overlay */}
        <NetworkBackground
          tone="dark"
          className="absolute inset-0 w-full h-full opacity-[0.35] pointer-events-none"
        />

        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-28 w-full">
          <div className="max-w-3xl">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#14B8A6]">
              Guardian IT Solutions · {COMPANY.address.regionCode}
            </p>

            <h1
              className="mt-6 font-serif text-white leading-[0.98] tracking-[-0.028em]"
              style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 6vw, 4.75rem)' }}
            >
              IT that gets paged
              <br />
              <span className="text-[#14B8A6]">before you notice.</span>
            </h1>

            <p className="mt-7 text-[16px] sm:text-[17px] text-white/70 leading-[1.6] max-w-xl">
              {COMPANY.yearsExperience} years of managed IT, cybersecurity, and bespoke
              software for medical practices and financial firms — one accountable team,
              out of New Jersey.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/free-it-audit"
                className="group inline-flex items-center gap-2 bg-white hover:bg-[#F4F8F7] text-[#062524] text-[13.5px] font-semibold pl-5 pr-4 py-3.5 rounded-[3px] transition-colors"
              >
                Request a 60-minute audit
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-white border border-white/20 hover:border-white/40 hover:bg-white/[0.04] px-5 py-3.5 rounded-[3px] transition-colors"
              >
                Engagement scope
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-white/55">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#14B8A6]" />
                HIPAA-aware by design
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#14B8A6]" />
                Founder-led
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#14B8A6]" />
                Nationwide
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          TRUST RAIL
          ════════════════════════════════════════════════ */}
      <section className="border-y border-[#D5E0DE] bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <TrustBar />
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          STATS — editorial figures
          ════════════════════════════════════════════════ */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <StatRow />
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          THESIS — manifesto column with drop cap
          ════════════════════════════════════════════════ */}
      <section className="relative bg-[#F4F8F7] border-y border-[#D5E0DE] overflow-hidden">
        <div
          className="absolute inset-0 bg-grid-fine opacity-70 pointer-events-none"
          aria-hidden
        />
        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <SectionLabel numeral={1} rule>
                Thesis
              </SectionLabel>
              <h2
                className="mt-5 font-serif text-[#0F4C4C] leading-[1.04] tracking-[-0.018em]"
                style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)' }}
              >
                IT done the way regulated industries actually need it.
              </h2>
              <hr className="rule-brass mt-8 max-w-[120px]" />
              <p
                className="mt-6 font-serif italic text-[18px] text-[#5F6E6D] leading-snug"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Generic MSPs treat regulation as paperwork. We treat it as the
                design constraint.
              </p>
            </div>

            <div className="lg:col-span-8 lg:pl-8 lg:border-l border-[#D5E0DE]">
              <p
                className="dropcap text-[17px] text-[#062524]/80 leading-[1.7] max-w-prose"
              >
                {COMPANY.brand} has spent twenty-five years operating IT for
                practices, firms, and businesses that don&apos;t get to learn
                from a breach the easy way — because the regulator, the patient,
                or the client doesn&apos;t allow it. The work has always been
                the same: keep the network up, keep the auditor happy, keep the
                people who actually do the work productive.
              </p>

              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">
                {VALUE_PROPS.map((v, i) => (
                  <article key={v.title} className="relative pl-7">
                    <span
                      className="absolute left-0 top-0 font-serif italic text-[18px] text-[#0F4C4C]"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      0{i + 1}
                    </span>
                    <h3
                      className="font-serif text-[20px] text-[#0F4C4C] leading-tight tracking-[-0.01em]"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      {v.title}
                    </h3>
                    <p className="mt-2 text-[13.5px] text-[#5F6E6D] leading-relaxed">
                      {v.body}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          SERVICES — featured + grid
          ════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-[#D5E0DE]">
        <div className="max-w-7xl mx-auto px-6 py-24 lg:py-28">
          <div className="flex items-end justify-between gap-6 mb-14 flex-wrap">
            <div className="max-w-2xl">
              <SectionLabel numeral={2} rule>
                The practice
              </SectionLabel>
              <h2
                className="mt-5 font-serif text-[#0F4C4C] leading-[1.04] tracking-[-0.018em]"
                style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.25rem, 4vw, 3.25rem)' }}
              >
                Eight service lines, under one roof.
              </h2>
              <p className="mt-5 text-[15px] text-[#5F6E6D] leading-relaxed max-w-xl">
                From day-to-day managed IT to custom mobile applications —
                when the work crosses boundaries, one accountable team owns it
                end-to-end.
              </p>
            </div>
            <Link
              href="/services"
              className="link-rule text-[13.5px]"
            >
              All service lines
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {(() => {
            const featured = SERVICES.find((s) => s.slug === 'bespoke-software')
            const restPrimary = SERVICES.filter((s) =>
              ['managed-it', 'cybersecurity', 'compliance', 'cloud'].includes(s.slug),
            )
            const restSecondary = SERVICES.filter((s) =>
              ['business-phone', 'communications', 'network'].includes(s.slug),
            )
            return (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
                  {featured && (
                    <div className="lg:col-span-1">
                      <ServiceCard service={featured} featured index={1} />
                    </div>
                  )}
                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
                    {restPrimary.map((s, i) => (
                      <ServiceCard key={s.slug} service={s} variant="compact" index={i + 2} />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {restSecondary.map((s, i) => (
                    <ServiceCard key={s.slug} service={s} variant="compact" index={i + 6} />
                  ))}
                </div>
              </>
            )
          })()}
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          INDUSTRIES — verticals
          ════════════════════════════════════════════════ */}
      <section className="bg-[#F4F8F7] border-b border-[#D5E0DE]">
        <div className="max-w-7xl mx-auto px-6 py-24 lg:py-28">
          <div className="flex items-end justify-between gap-6 mb-14 flex-wrap">
            <div className="max-w-2xl">
              <SectionLabel numeral={3} rule>
                Verticals
              </SectionLabel>
              <h2
                className="mt-5 font-serif text-[#0F4C4C] leading-[1.04] tracking-[-0.018em]"
                style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.25rem, 4vw, 3.25rem)' }}
              >
                Compliance language we speak fluently.
              </h2>
              <p className="mt-5 text-[15px] text-[#5F6E6D] leading-relaxed max-w-xl">
                Every control we deploy maps to a real framework — because the
                people who&apos;ll review it know the difference between a
                checkbox and an attested control.
              </p>
            </div>
            <Link href="/industries" className="link-rule text-[13.5px]">
              All verticals
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {INDUSTRIES.map((i, idx) => (
              <IndustryCard
                key={i.slug}
                industry={i}
                icon={industryIcons[i.slug as keyof typeof industryIcons] ?? Briefcase}
                index={idx + 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          PROCESS PREVIEW
          ════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-[#D5E0DE]">
        <div className="max-w-7xl mx-auto px-6 py-24 lg:py-28">
          <div className="flex items-end justify-between gap-6 mb-14 flex-wrap">
            <div className="max-w-2xl">
              <SectionLabel numeral={4} rule>
                The engagement
              </SectionLabel>
              <h2
                className="mt-5 font-serif text-[#0F4C4C] leading-[1.04] tracking-[-0.018em]"
                style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.25rem, 4vw, 3.25rem)' }}
              >
                Every engagement runs the same way.
              </h2>
              <p className="mt-5 text-[15px] text-[#5F6E6D] leading-relaxed max-w-xl">
                Nine stages, codified — from discovery, to delivery, to
                ongoing operations. Every milestone is visible to you in the
                client portal.
              </p>
            </div>
            <Link href="/process" className="link-rule text-[13.5px]">
              Full lifecycle
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {HERO_STAGES.map((s) => (
              <li
                key={s.number}
                className="relative bg-white rounded-[4px] border border-[#D5E0DE] p-6 overflow-hidden hover:border-[#0F4C4C]/40 hover:shadow-[0_24px_40px_-20px_rgba(8,47,47,0.18)] transition-all"
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#0F766E]/40" />
                <div className="flex items-baseline justify-between gap-3">
                  <span
                    className="font-serif text-[44px] leading-none text-[#0F4C4C] tracking-[-0.02em]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {String(s.number).padStart(2, '0')}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F4C4C]">
                    {s.duration}
                  </span>
                </div>
                <div className="mt-3 w-9 h-px bg-[#0F766E]" />
                <h3
                  className="mt-4 font-serif text-[20px] text-[#0F4C4C] leading-tight tracking-[-0.01em]"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {s.title}
                </h3>
                <p className="mt-2 text-[13px] text-[#5F6E6D] line-clamp-3 leading-relaxed">
                  {s.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          INLINE LEAD FORM — Letter to the editor
          ════════════════════════════════════════════════ */}
      <section className="relative bg-[#F4F8F7] border-b border-[#D5E0DE] overflow-hidden">
        <div className="absolute inset-0 bg-grid-fine opacity-70 pointer-events-none" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:items-start">
            <div className="lg:col-span-6">
              <SectionLabel numeral={5} rule>
                Correspondence
              </SectionLabel>
              <h2
                className="mt-5 font-serif text-[#0F4C4C] leading-[1.04] tracking-[-0.018em]"
                style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.25rem, 4vw, 3.25rem)' }}
              >
                Write to the firm.
                <br />
                <span className="italic text-[#0F4C4C]">A real engineer replies.</span>
              </h2>
              <p className="mt-6 text-[15px] text-[#5F6E6D] leading-relaxed max-w-lg">
                Tell us about your environment, your timeline, or a problem
                you&apos;re wrestling with. We&apos;ll respond with concrete
                next steps — even if the honest answer is &ldquo;you should
                hire someone else for this.&rdquo;
              </p>

              <hr className="rule-brass mt-8 max-w-[180px]" />

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F4C4C]">
                    By telephone
                  </p>
                  <a
                    href={`tel:${COMPANY.phoneE164}`}
                    className="mt-2 font-serif text-[24px] text-[#0F4C4C] block tracking-[-0.01em]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {COMPANY.phone}
                  </a>
                  <p className="font-mono text-[10.5px] text-[#5F6E6D] mt-1">
                    24/7 for clients · biz hrs for new
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F4C4C]">
                    By electronic post
                  </p>
                  <a
                    href={`mailto:${COMPANY.email}`}
                    className="mt-2 font-serif text-[20px] text-[#0F4C4C] block break-all tracking-[-0.005em]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {COMPANY.email}
                  </a>
                  <p className="font-mono text-[10.5px] text-[#5F6E6D] mt-1">
                    Reply within 1 biz day
                  </p>
                </div>
              </div>

              <div className="mt-10 flex items-center gap-3 text-[12.5px] text-[#5F6E6D]">
                <ShieldCheck className="w-4 h-4 text-[#0F4C4C]" />
                <span>
                  Confidential. Not shared. No marketing list without explicit
                  consent.
                </span>
              </div>
            </div>

            <div className="lg:col-span-6">
              <LeadForm
                source="contact_form"
                heading="Begin the correspondence."
                body="We respond within one business day. Always."
                submitLabel="Send the letter"
              />
            </div>
          </div>
        </div>
      </section>

      <Cta
        label="Engagement"
        heading={
          <>
            Stop running IT in your inbox.
            <br />
            <span className="italic text-[#0F766E]">Let us audit yours in 60 minutes.</span>
          </>
        }
        body="A senior engineer reviews your network, endpoints, backup posture, and compliance gaps — and hands you a written punch list. Yours to keep. No sales follow-up unless you ask."
      />
    </>
  )
}
