import type { Metadata } from 'next'
import { Phone, Mail, MapPin, type LucideIcon } from 'lucide-react'
import { COMPANY, VALUE_PROPS } from '@gitsols/constants'
import StatRow from '@/components/marketing/StatRow'
import FounderCard from '@/components/marketing/FounderCard'
import Cta from '@/components/marketing/Cta'
import PageHero from '@/components/marketing/PageHero'
import SectionLabel from '@/components/marketing/SectionLabel'

export const metadata: Metadata = {
  title: 'Why GITSOLS — Founder-led MSP for regulated industries',
  description:
    '25+ years running IT for healthcare, financial, and professional services firms. Founder-led, compliance-aware, and built to be the last MSP you hire.',
  alternates: { canonical: '/why-gitsols' },
}

const PRINCIPLES = [
  {
    title: 'We take responsibility.',
    body: 'When the network is down, the ticket count does not matter — getting you back up does. We do not finger-point to the carrier, the SaaS vendor, or the manufacturer. We own the resolution.',
  },
  {
    title: 'We measure what matters.',
    body: 'Uptime, ticket SLA, milestone burn-down, NPS at every approval. Numbers that show up in our quarterly business reviews — and on your dashboards.',
  },
  {
    title: 'We design for audit.',
    body: 'Healthcare and financial clients live in audit cycles. Every control we deploy maps to a real framework (HIPAA, SOC 2, NIST, NYDFS) so artifacts collect themselves.',
  },
  {
    title: 'We hire engineers, not technicians.',
    body: 'Helpdesk that escalates correctly. PMs who push back on bad scope. Engineers who can architect cloud and write code. One team across managed and built work.',
  },
]

export default function WhyGitsolsPage() {
  return (
    <>
      <PageHero
        eyebrow="The firm"
        title={
          <>
            Founder-led. Compliance-aware.
            <br />
            <span className="text-[#14B8A6]">Built to be the last MSP you hire.</span>
          </>
        }
        subtitle={`${COMPANY.legalName} brought ${COMPANY.yearsExperience}+ years of enterprise-grade IT discipline to small and mid-sized organizations — at a price point that makes sense for practices, firms, and growing teams that don't get to learn from a breach the easy way.`}
      />

      {/* ════════════════════════════════════════════════
          STATS
          ════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-[#D5E0DE]">
        <div className="max-w-7xl mx-auto px-6">
          <StatRow />
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          PRINCIPLES — tenets
          ════════════════════════════════════════════════ */}
      <section className="bg-[#F4F8F7] border-b border-[#D5E0DE]">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-14">
            <div className="lg:col-span-4">
              <SectionLabel numeral={1} rule>
                Article I
              </SectionLabel>
              <h2
                className="mt-5 font-serif text-[#0F4C4C] leading-[1.04] tracking-[-0.018em]"
                style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)' }}
              >
                Four operating principles
                <br />
                <span className="italic">we don&apos;t flex on.</span>
              </h2>
              <hr className="rule-brass mt-7 max-w-[120px]" />
              <p className="mt-6 text-[14.5px] text-[#5F6E6D] leading-relaxed max-w-md">
                Codified in the founding charter. Re-read at every quarterly
                review. They&apos;re what you can hold us to.
              </p>
            </div>
            <ol className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              {PRINCIPLES.map((p, i) => (
                <li key={p.title} className="relative pl-14">
                  <span
                    className="absolute left-0 top-0 font-serif text-[44px] leading-none text-[#0F4C4C]/85 tracking-[-0.02em]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="absolute left-0 top-12 w-9 h-px bg-[#0F766E]" />
                  <h3
                    className="font-serif text-[22px] text-[#0F4C4C] leading-tight tracking-[-0.01em]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {p.title}
                  </h3>
                  <p className="mt-3 text-[14px] text-[#5F6E6D] leading-relaxed">
                    {p.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          THE FOUNDER
          ════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-[#D5E0DE]">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-3xl mb-12">
            <SectionLabel numeral={2} rule>
              Article II
            </SectionLabel>
            <h2
              className="mt-5 font-serif text-[#0F4C4C] leading-[1.04] tracking-[-0.018em]"
              style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)' }}
            >
              The kind of operator
              <br />
              <span className="italic">we built {COMPANY.brand} around.</span>
            </h2>
            <hr className="rule-brass mt-7 max-w-[140px]" />
          </div>
          <FounderCard />
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          FIRST 30 DAYS
          ════════════════════════════════════════════════ */}
      <section className="bg-[#F4F8F7] border-b border-[#D5E0DE]">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:items-start">
            <div className="lg:col-span-4">
              <SectionLabel numeral={3} rule>
                Article III
              </SectionLabel>
              <h2
                className="mt-5 font-serif text-[#0F4C4C] leading-[1.04] tracking-[-0.018em]"
                style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)' }}
              >
                What you get the day
                <br />
                <span className="italic">after you sign.</span>
              </h2>
              <hr className="rule-brass mt-7 max-w-[120px]" />
              <p className="mt-6 text-[14.5px] text-[#5F6E6D] leading-relaxed max-w-md">
                The fastest way to see the difference is to look at the first
                thirty days of a {COMPANY.brand} engagement.
              </p>
            </div>
            <ol className="lg:col-span-8 space-y-4">
              {VALUE_PROPS.map((v, i) => (
                <li
                  key={v.title}
                  className="relative bg-white rounded-[4px] border border-[#D5E0DE] p-6 overflow-hidden"
                >
                  <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-[#0F766E]/40" />
                  <div className="grid grid-cols-[60px_1fr] gap-5 items-start">
                    <span
                      className="font-serif text-[40px] leading-none text-[#0F4C4C] tracking-[-0.02em]"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3
                        className="font-serif text-[20px] text-[#0F4C4C] leading-tight tracking-[-0.01em]"
                        style={{ fontFamily: 'var(--font-serif)' }}
                      >
                        {v.title}
                      </h3>
                      <p className="mt-2 text-[13.5px] text-[#5F6E6D] leading-relaxed">
                        {v.body}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          OFFICE
          ════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-[#D5E0DE]">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-3xl mb-12">
            <SectionLabel numeral={4} rule>
              Article IV
            </SectionLabel>
            <h2
              className="mt-5 font-serif text-[#0F4C4C] leading-[1.04] tracking-[-0.018em]"
              style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)' }}
            >
              Where to find us.
            </h2>
            <hr className="rule-brass mt-7 max-w-[120px]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <HqCard
              icon={MapPin}
              eyebrow="Registered office"
              primary={COMPANY.address.street}
              helper={`${COMPANY.address.city}, ${COMPANY.address.regionCode} ${COMPANY.address.postalCode}`}
            />
            <HqCard
              icon={Phone}
              eyebrow="By telephone"
              primary={COMPANY.phone}
              helper="24/7 for current clients · business hours for new"
            />
            <HqCard
              icon={Mail}
              eyebrow="By electronic post"
              primary={COMPANY.email}
              helper="One business day reply, always"
            />
          </div>
        </div>
      </section>

      <Cta
        label="Engagement"
        heading={
          <>
            See how we work.
            <br />
            <span className="italic text-[#0F766E]">Free IT audit, sixty minutes.</span>
          </>
        }
        body="The audit gets you concrete findings. If we fit, you have the start of an engagement. If not, you keep the report."
      />
    </>
  )
}

function HqCard({
  icon: Icon,
  eyebrow,
  primary,
  helper,
}: {
  icon: LucideIcon
  eyebrow: string
  primary: string
  helper: string
}) {
  return (
    <div className="relative bg-white rounded-[4px] border border-[#D5E0DE] p-6 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#0F766E]/40" />
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-[3px] bg-[#ECFEFE] border border-[#CFFAFA] flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-[#0F4C4C]" />
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F4C4C] pt-2">
          {eyebrow}
        </p>
      </div>
      <p
        className="font-serif text-[20px] text-[#0F4C4C] leading-snug tracking-[-0.01em] break-words"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        {primary}
      </p>
      <p className="mt-2 text-[12.5px] text-[#5F6E6D] leading-relaxed">{helper}</p>
    </div>
  )
}
