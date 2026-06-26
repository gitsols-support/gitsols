import type { Metadata } from 'next'
import { BookOpen, FileText, Newspaper, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import SectionLabel from '@/components/marketing/SectionLabel'
import PostCard from '@/components/marketing/PostCard'
import Cta from '@/components/marketing/Cta'
import PageHero from '@/components/marketing/PageHero'
import { getPosts, getCaseStudies } from '@/server/content'

export const metadata: Metadata = {
  title: 'Resources — Blog, case studies, IT audit checklist',
  description:
    'GITSOLS resources for IT and compliance teams in healthcare, financial, and professional services. Blog, case studies, and downloadable checklists.',
  alternates: { canonical: '/resources' },
}

export default function ResourcesPage() {
  const recentPosts = getPosts().slice(0, 3)
  const recentCases = getCaseStudies().slice(0, 3)

  const cards = [
    {
      icon: BookOpen,
      title: 'Blog',
      body: 'Practical writing on managed IT, cybersecurity, and compliance — written by the engineers who do the work.',
      href: '/resources/blog',
      count: getPosts().length,
    },
    {
      icon: Newspaper,
      title: 'Case studies',
      body: 'Real engagements with scope, milestones, and concrete outcomes. Clients anonymized where contractually required.',
      href: '/resources/case-studies',
      count: getCaseStudies().length,
    },
    {
      icon: FileText,
      title: 'Free IT Audit Checklist',
      body: 'The same checklist we use on day-one engagements. PDF — no email required.',
      href: '/resources/audit-checklist.pdf',
      count: null,
    },
  ] as const

  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="Field notes from the work."
        subtitle="Most of what we have learned about running IT for regulated industries is in the work itself. Here is the part we are willing to give away."
      />

      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {cards.map((r) => {
              const Icon = r.icon
              const badge =
                r.count === null
                  ? 'Free PDF'
                  : r.count === 0
                    ? 'Coming soon'
                    : `${r.count} ${r.count === 1 ? 'piece' : 'pieces'}`
              return (
                <Link
                  key={r.title}
                  href={r.href}
                  className="group block bg-white rounded-2xl border border-[#E2E8E8] p-6 hover:border-[#0F4C4C]/30 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#ECFEFE] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#0F4C4C]" />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.14em] font-bold text-[#14B8A6]/80">
                      {badge}
                    </span>
                  </div>
                  <h3 className="mt-5 text-base font-semibold text-[#0F4C4C] group-hover:text-[#155E5E]">
                    {r.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{r.body}</p>
                  <div className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F4C4C]">
                    Open <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {recentPosts.length > 0 && (
        <section className="border-t border-[#E2E8E8]">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="flex items-end justify-between gap-6 mb-10 flex-wrap">
              <div>
                <SectionLabel>Latest posts</SectionLabel>
                <h2 className="mt-2 text-2xl font-bold text-[#0F4C4C]">From the blog.</h2>
              </div>
              <Link
                href="/resources/blog"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F4C4C] hover:text-[#155E5E]"
              >
                All posts <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentPosts.map((p) => (
                <PostCard
                  key={p.slug}
                  href={`/resources/blog/${p.slug}`}
                  title={p.frontmatter.title}
                  description={p.frontmatter.description}
                  publishedAt={p.frontmatter.publishedAt}
                  readingTimeMinutes={p.readingTimeMinutes}
                  eyebrow="Blog"
                  tags={p.frontmatter.tags}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {recentCases.length > 0 && (
        <section className="border-t border-[#E2E8E8] bg-white">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="flex items-end justify-between gap-6 mb-10 flex-wrap">
              <div>
                <SectionLabel>Recent engagements</SectionLabel>
                <h2 className="mt-2 text-2xl font-bold text-[#0F4C4C]">
                  Case studies from the field.
                </h2>
              </div>
              <Link
                href="/resources/case-studies"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F4C4C] hover:text-[#155E5E]"
              >
                All case studies <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentCases.map((c) => (
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
          </div>
        </section>
      )}

      <Cta
        heading={
          <>
            Want the IT audit instead?
            <br />
            <span className="text-white/70">It is more useful than reading about ours.</span>
          </>
        }
        body="60-minute audit, written findings, no obligation. We will tell you straight whether you need GITSOLS or someone else."
      />
    </>
  )
}
