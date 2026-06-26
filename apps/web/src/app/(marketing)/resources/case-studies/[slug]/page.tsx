import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { getServiceBySlug } from '@gitsols/constants'
import SectionLabel from '@/components/marketing/SectionLabel'
import MdxBody from '@/components/marketing/MdxBody'
import ServiceCard from '@/components/marketing/ServiceCard'
import Cta from '@/components/marketing/Cta'
import { getCaseStudies, getCaseStudyBySlug } from '@/server/content'

interface CaseStudyPageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams(): { slug: string }[] {
  return getCaseStudies().map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: CaseStudyPageProps): Promise<Metadata> {
  const { slug } = await params
  const study = getCaseStudyBySlug(slug)
  if (!study) return {}
  return {
    title: study.frontmatter.title,
    description: study.frontmatter.description,
    alternates: { canonical: `/resources/case-studies/${study.slug}` },
    openGraph: {
      title: study.frontmatter.title,
      description: study.frontmatter.description,
      type: 'article',
      publishedTime: study.frontmatter.publishedAt,
      authors: [study.frontmatter.author],
    },
  }
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params
  const study = getCaseStudyBySlug(slug)
  if (!study) notFound()

  const fm = study.frontmatter
  const linkedServices = fm.services
    .map((s) => getServiceBySlug(s))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))

  return (
    <>
      <article className="bg-white">
        <header className="border-b border-[#E2E8E8]">
          <div className="max-w-3xl mx-auto px-6 pt-14 pb-10">
            <Link
              href="/resources/case-studies"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0F4C4C]/70 hover:text-[#0F4C4C] mb-6"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to case studies
            </Link>
            <SectionLabel>{fm.industry} · Case study</SectionLabel>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-[#0F4C4C] leading-[1.15]">
              {fm.title}
            </h1>
            <p className="mt-4 text-lg text-[#042F2E]/75 leading-relaxed">{fm.description}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span className="text-[#0F4C4C] font-medium">{fm.client}</span>
              <span aria-hidden>·</span>
              <time dateTime={fm.publishedAt}>{formatDate(fm.publishedAt)}</time>
              <span aria-hidden>·</span>
              <span>{study.readingTimeMinutes} min read</span>
            </div>
          </div>
        </header>

        {fm.outcomes.length > 0 && (
          <div className="border-b border-[#E2E8E8] bg-[#ECFEFE]">
            <div className="max-w-3xl mx-auto px-6 py-8">
              <SectionLabel>Outcomes</SectionLabel>
              <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fm.outcomes.map((o) => (
                  <li key={o} className="flex gap-2.5 text-sm text-[#0F4C4C]">
                    <CheckCircle2 className="w-4 h-4 text-[#14B8A6] mt-0.5 flex-shrink-0" />
                    <span className="leading-relaxed">{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto px-6 py-12">
          <MdxBody source={study.body} />
        </div>
      </article>

      {linkedServices.length > 0 && (
        <section className="border-t border-[#E2E8E8] bg-white">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <SectionLabel>Services delivered</SectionLabel>
            <h2 className="mt-2 text-2xl font-bold text-[#0F4C4C] mb-8">
              What we ran on this engagement.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {linkedServices.map((s) => (
                <ServiceCard key={s.slug} service={s} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Cta
        heading={
          <>
            Operating on similar scale?
            <br />
            <span className="text-white/70">Start with a free 60-minute audit.</span>
          </>
        }
        body="The audit follows the same playbook stage 1 of every engagement runs through. Even if we don't end up working together, you keep the report."
      />
    </>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export const dynamic = 'force-static'
