import type { Metadata } from 'next'
import PostCard from '@/components/marketing/PostCard'
import Cta from '@/components/marketing/Cta'
import PageHero from '@/components/marketing/PageHero'
import { getCaseStudies } from '@/server/content'

export const metadata: Metadata = {
  title: 'Case studies — Real GITSOLS engagements',
  description:
    'Real engagements: medical groups, financial firms, and bespoke software builds. Scope, milestones, and concrete outcomes.',
  alternates: { canonical: '/resources/case-studies' },
}

export default function CaseStudiesIndexPage() {
  const cases = getCaseStudies()

  return (
    <>
      <PageHero
        eyebrow="Case studies"
        title="Real engagements. Real numbers."
        subtitle="Clients are anonymized where contractually required. The scope, milestones, and outcomes are real."
      />

      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          {cases.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E2E8E8] p-10 text-center bg-white">
              <p className="text-sm text-gray-500">
                More case studies coming as engagements complete and clients sign off on
                publication.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {cases.map((c) => (
                <PostCard
                  key={c.slug}
                  href={`/resources/case-studies/${c.slug}`}
                  title={c.frontmatter.title}
                  description={c.frontmatter.description}
                  publishedAt={c.frontmatter.publishedAt}
                  readingTimeMinutes={c.readingTimeMinutes}
                  eyebrow={c.frontmatter.industry}
                  tags={c.frontmatter.services}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Cta
        heading={
          <>
            Want to be the next case study?
            <br />
            <span className="text-white/70">Start with a free IT audit.</span>
          </>
        }
        body="The audit is stage 1 of every engagement. If we fit, you already have the start of a SoW."
      />
    </>
  )
}
