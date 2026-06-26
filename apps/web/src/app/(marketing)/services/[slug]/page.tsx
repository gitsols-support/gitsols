import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import {
  SERVICE_SLUGS,
  SERVICE_CATEGORY_LABELS,
  getServiceBySlug,
  COMPANY,
} from '@gitsols/constants'
import SectionLabel from '@/components/marketing/SectionLabel'
import ServiceCard from '@/components/marketing/ServiceCard'
import LeadForm from '@/components/marketing/LeadForm'
import Cta from '@/components/marketing/Cta'
import PageHero from '@/components/marketing/PageHero'

interface ServiceDetailPageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams(): { slug: string }[] {
  return SERVICE_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: ServiceDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const service = getServiceBySlug(slug)
  if (!service) return {}
  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: { canonical: `/services/${service.slug}` },
  }
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { slug } = await params
  const service = getServiceBySlug(slug)
  if (!service) notFound()

  const related = service.related
    .map((s) => getServiceBySlug(s))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))

  const isBespoke = service.slug === 'bespoke-software'
  const serviceNumber = SERVICE_SLUGS.indexOf(service.slug) + 1
  const padded = String(serviceNumber).padStart(2, '0')

  return (
    <>
      <PageHero
        breadcrumb={
          <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/55">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="text-white/30">/</span>
            <Link href="/services" className="hover:text-white">Services</Link>
            <span className="text-white/30">/</span>
            <span className="text-white">{service.shortName}</span>
          </nav>
        }
        eyebrow={`№ ${padded} · ${SERVICE_CATEGORY_LABELS[service.category]}`}
        title={
          <>
            {service.name}
            <br />
            <span className="text-[#14B8A6]">{service.tagline}</span>
          </>
        }
        subtitle={service.intro}
        cta={
          <>
            <Link
              href={isBespoke ? '/services/bespoke-software/scope' : '/free-it-audit'}
              className="group inline-flex items-center gap-2 bg-white hover:bg-[#F4F8F7] text-[#062524] text-[13.5px] font-semibold pl-5 pr-4 py-3.5 rounded-[3px] transition-colors"
            >
              {isBespoke ? 'Scope a project' : 'Schedule a free audit'}
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
          CAPABILITIES — the work, broken down
          ════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-[#D5E0DE]">
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
                The work, broken into deliverables.
              </h2>
              <hr className="rule-brass mt-7 max-w-[120px]" />
              <p className="mt-6 text-[14.5px] text-[#5F6E6D] leading-relaxed">
                Every line we run carries the same posture: a fixed scope, a
                named owner, and an artifact that survives the engagement.
              </p>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              {service.capabilities.map((c, i) => (
                <article key={c.title} className="relative pl-10">
                  <span
                    className="absolute left-0 top-0 font-mono text-[11px] uppercase tracking-[0.18em] text-[#0F766E]"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3
                    className="font-serif text-[20px] text-[#0F4C4C] leading-tight tracking-[-0.01em]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {c.title}
                  </h3>
                  <p className="mt-2 text-[13.5px] text-[#5F6E6D] leading-relaxed">
                    {c.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          WHO IT'S FOR + LEAD FORM
          ════════════════════════════════════════════════ */}
      <section className="bg-[#F4F8F7] border-b border-[#D5E0DE]">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:items-start">
            <div className="lg:col-span-6">
              <SectionLabel numeral={2} rule>
                Article II
              </SectionLabel>
              <h2
                className="mt-5 font-serif text-[#0F4C4C] leading-[1.04] tracking-[-0.018em]"
                style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)' }}
              >
                Who we do
                <br />
                <span className="italic">{service.shortName.toLowerCase()}</span> for.
              </h2>
              <hr className="rule-brass mt-7 max-w-[140px]" />

              <ol className="mt-10 space-y-6">
                {service.whoItsFor.map((p, i) => (
                  <li key={p} className="grid grid-cols-[44px_1fr] gap-4 items-start">
                    <span
                      className="font-serif text-[28px] text-[#0F4C4C] leading-none tracking-[-0.02em]"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[15px] text-[#062524]/80 leading-relaxed pt-1">
                      {p}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="lg:col-span-6 lg:pl-8 lg:border-l border-[#D5E0DE]">
              <LeadForm
                source={isBespoke ? 'bespoke_scope_request' : 'service_inquiry'}
                defaultServiceInterest={service.slug}
                heading={
                  isBespoke
                    ? `Scope a ${service.shortName.toLowerCase()} project`
                    : `Inquire about ${service.shortName.toLowerCase()}`
                }
                body="Tell us about your environment and timeline. A real engineer responds within one business day."
                submitLabel="Send inquiry"
                showServiceInterest={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          RELATED SERVICES
          ════════════════════════════════════════════════ */}
      {related.length > 0 && (
        <section className="bg-white border-b border-[#D5E0DE]">
          <div className="max-w-7xl mx-auto px-6 py-24">
            <div className="flex items-end justify-between gap-6 mb-12 flex-wrap">
              <div className="max-w-2xl">
                <SectionLabel numeral={3} rule>
                  Often paired with
                </SectionLabel>
                <h2
                  className="mt-5 font-serif text-[#0F4C4C] leading-[1.04] tracking-[-0.018em]"
                  style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)' }}
                >
                  Adjacent work most clients ask for next.
                </h2>
              </div>
              <Link href="/services" className="link-rule text-[13.5px]">
                All services
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {related.map((s, i) => (
                <ServiceCard key={s.slug} service={s} index={i + 1} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Cta
        label={isBespoke ? 'Build estimate' : 'Engagement'}
        heading={
          isBespoke ? (
            <>
              Have a build in mind?
              <br />
              <span className="italic text-[#0F766E]">A two-week discovery sprint gets you a real spec.</span>
            </>
          ) : (
            <>
              See what we&apos;d do.
              <br />
              <span className="italic text-[#0F766E]">Start with a free 60-minute audit.</span>
            </>
          )
        }
        body={
          isBespoke
            ? 'Discovery sprints scope the build, document architecture, and produce a fixed-price or T&M estimate you can budget against.'
            : 'We review what you have, hand you a punch list, and tell you straight whether you need GITSOLS or someone else.'
        }
        primaryLabel={isBespoke ? 'Scope a project' : 'Schedule the audit'}
        primaryHref={isBespoke ? '/services/bespoke-software/scope' : '/free-it-audit'}
      />
    </>
  )
}

// Keep static — these pages don't have per-request data.
export const dynamic = 'force-static'
