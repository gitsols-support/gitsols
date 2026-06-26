import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowUpRight, ShieldCheck, AlertTriangle } from 'lucide-react'
import {
  INDUSTRY_SLUGS,
  getIndustryBySlug,
  getServiceBySlug,
  COMPANY,
} from '@gitsols/constants'
import SectionLabel from '@/components/marketing/SectionLabel'
import ServiceCard from '@/components/marketing/ServiceCard'
import LeadForm from '@/components/marketing/LeadForm'
import Cta from '@/components/marketing/Cta'
import PageHero from '@/components/marketing/PageHero'
import TrustBar from '@/components/marketing/TrustBar'

interface IndustryDetailPageProps {
  params: Promise<{ slug: string }>
}


export function generateStaticParams(): { slug: string }[] {
  return INDUSTRY_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: IndustryDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const industry = getIndustryBySlug(slug)
  if (!industry) return {}
  return {
    title: industry.metaTitle,
    description: industry.metaDescription,
    alternates: { canonical: `/industries/${industry.slug}` },
  }
}

export default async function IndustryDetailPage({ params }: IndustryDetailPageProps) {
  const { slug } = await params
  const industry = getIndustryBySlug(slug)
  if (!industry) notFound()

  const recommended = industry.recommendedServices
    .map((s) => getServiceBySlug(s))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))

  const industryNumber = INDUSTRY_SLUGS.indexOf(industry.slug) + 1
  const padded = String(industryNumber).padStart(2, '0')

  return (
    <>
      <PageHero
        breadcrumb={
          <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/55">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="text-white/30">/</span>
            <Link href="/industries" className="hover:text-white">Industries</Link>
            <span className="text-white/30">/</span>
            <span className="text-white">{industry.shortName}</span>
          </nav>
        }
        eyebrow={`№ ${padded} · ${industry.compliance.length} frameworks`}
        title={
          <>
            {industry.name}
            <br />
            <span className="text-[#14B8A6]">{industry.tagline}</span>
          </>
        }
        subtitle={industry.intro}
        cta={
          <>
            <Link
              href="/free-it-audit"
              className="group inline-flex items-center gap-2 bg-white hover:bg-[#F4F8F7] text-[#062524] text-[13.5px] font-semibold pl-5 pr-4 py-3.5 rounded-[3px] transition-colors"
            >
              Schedule a free audit
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
            <a
              href={`tel:${COMPANY.phoneE164}`}
              className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-white border border-white/20 hover:border-white/40 hover:bg-white/[0.04] px-5 py-3.5 rounded-[3px] transition-colors"
            >
              Call {COMPANY.phone}
            </a>
          </>
        }
      />

      {/* ════════════════════════════════════════════════
          TRUST RAIL
          ════════════════════════════════════════════════ */}
      <section className="border-b border-[#D5E0DE] bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <TrustBar compact />
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          PAIN POINTS — what we hear
          ════════════════════════════════════════════════ */}
      <section className="bg-[#F4F8F7] border-b border-[#D5E0DE]">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <SectionLabel numeral={1} rule>
                Article I
              </SectionLabel>
              <h2
                className="mt-5 font-serif text-[#0F4C4C] leading-[1.04] tracking-[-0.018em]"
                style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)' }}
              >
                What we hear
                <br />
                <span className="italic">on the first call.</span>
              </h2>
              <hr className="rule-brass mt-7 max-w-[120px]" />
              <p className="mt-6 text-[14.5px] text-[#5F6E6D] leading-relaxed max-w-md">
                If two of these feel familiar, we should talk. If three do, we
                should have talked last quarter.
              </p>
            </div>
            <ul className="lg:col-span-8 space-y-3">
              {industry.painPoints.map((p, i) => (
                <li
                  key={p}
                  className="relative flex gap-5 bg-white rounded-[4px] border border-[#D5E0DE] p-5 overflow-hidden"
                >
                  <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-[#0F766E]/40" />
                  <span
                    className="font-serif text-[34px] leading-none text-[#0F4C4C]/85 tracking-[-0.02em] w-10 flex-shrink-0"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#0F766E]" />
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F766E]">
                        Symptom
                      </span>
                    </div>
                    <p className="text-[14.5px] text-[#062524]/85 leading-relaxed">{p}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          COMPLIANCE FRAMEWORKS
          ════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-[#D5E0DE]">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">
            <div className="lg:col-span-4">
              <SectionLabel numeral={2} rule>
                Article II
              </SectionLabel>
              <h2
                className="mt-5 font-serif text-[#0F4C4C] leading-[1.04] tracking-[-0.018em]"
                style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)' }}
              >
                Specific regulations,
                <br />
                <span className="italic">not generic checklists.</span>
              </h2>
              <hr className="rule-brass mt-7 max-w-[120px]" />
              <p className="mt-6 text-[14.5px] text-[#5F6E6D] leading-relaxed">
                We name the rule because we work the rule. Every control we
                deploy maps to a real framework — audit-defensible from day
                one.
              </p>
            </div>
            <ul className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {industry.compliance.map((c) => (
                <li
                  key={c}
                  className="relative flex gap-3 bg-[#F4F8F7] rounded-[4px] border border-[#D5E0DE] p-4"
                >
                  <div className="w-9 h-9 rounded-[3px] bg-white border border-[#D5E0DE] flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4 text-[#0F4C4C]" />
                  </div>
                  <p className="text-[13.5px] text-[#062524]/85 leading-relaxed pt-1.5">{c}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          RECOMMENDED SERVICES
          ════════════════════════════════════════════════ */}
      {recommended.length > 0 && (
        <section className="bg-[#F4F8F7] border-b border-[#D5E0DE]">
          <div className="max-w-7xl mx-auto px-6 py-24">
            <div className="flex items-end justify-between gap-6 mb-12 flex-wrap">
              <div className="max-w-2xl">
                <SectionLabel numeral={3} rule>
                  Article III
                </SectionLabel>
                <h2
                  className="mt-5 font-serif text-[#0F4C4C] leading-[1.04] tracking-[-0.018em]"
                  style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)' }}
                >
                  Services that load-bear for {industry.shortName.toLowerCase()} clients.
                </h2>
              </div>
              <Link href="/services" className="link-rule text-[13.5px]">
                All services
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recommended.map((s, i) => (
                <ServiceCard key={s.slug} service={s} index={i + 1} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════
          INQUIRY FORM
          ════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-[#D5E0DE]">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:items-start">
            <div className="lg:col-span-6">
              <SectionLabel numeral={4} rule>
                Correspondence
              </SectionLabel>
              <h2
                className="mt-5 font-serif text-[#0F4C4C] leading-[1.04] tracking-[-0.018em]"
                style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)' }}
              >
                A thirty-minute call
                <br />
                <span className="italic text-[#0F766E]">beats six emails.</span>
              </h2>
              <hr className="rule-brass mt-7 max-w-[160px]" />
              <p className="mt-6 text-[15px] text-[#5F6E6D] leading-relaxed max-w-lg">
                Tell us about your environment and the regulatory pressure
                you&apos;re under. We&apos;ll respond with concrete next steps
                within one business day.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-2">
                {['HIPAA-aware', 'NYDFS-ready', 'SOC 2 Type II'].map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[#0F4C4C] bg-white border border-[#D5E0DE] px-3 py-1.5 rounded-[3px]"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E]" />
                    {badge}
                  </span>
                ))}
              </div>
            </div>
            <div className="lg:col-span-6">
              <LeadForm
                source="service_inquiry"
                defaultIndustry={industry.slug}
                heading={`On ${industry.shortName.toLowerCase()}, in particular`}
                body="We respond within one business day. Always."
                showIndustry={false}
                submitLabel="Send inquiry"
              />
            </div>
          </div>
        </div>
      </section>

      <Cta
        label="Engagement"
        heading={
          <>
            Operating in {industry.shortName.toLowerCase()}?
            <br />
            <span className="italic text-[#0F766E]">Start with a free 60-minute audit.</span>
          </>
        }
        body="We review your environment, name the gaps, and hand you a punch list — yours to keep, no obligation."
      />
    </>
  )
}

export const dynamic = 'force-static'
