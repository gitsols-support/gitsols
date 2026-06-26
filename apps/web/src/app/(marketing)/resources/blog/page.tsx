import type { Metadata } from 'next'
import PostCard from '@/components/marketing/PostCard'
import Cta from '@/components/marketing/Cta'
import PageHero from '@/components/marketing/PageHero'
import { getPosts } from '@/server/content'

export const metadata: Metadata = {
  title: 'Blog — Notes from the GITSOLS engineering team',
  description:
    'Practical writing on managed IT, cybersecurity, HIPAA and financial-services compliance, and bespoke software — by the engineers who do the work.',
  alternates: { canonical: '/resources/blog' },
}

export default function BlogIndexPage() {
  const posts = getPosts()

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Notes from the work."
        subtitle="Practical writing on the things we do — by the engineers who do them. No buzzwords, no thinkpieces. The pieces below are what we wished existed when we started."
      />

      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E2E8E8] p-10 text-center bg-white">
              <p className="text-sm text-gray-500">
                The first posts are being authored — check back, or drop us a topic request.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.map((p) => (
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
          )}
        </div>
      </section>

      <Cta
        heading={
          <>
            Have a topic we should cover?
            <br />
            <span className="text-white/70">Send it our way.</span>
          </>
        }
        body="If you are dealing with a problem that does not have a good answer on the open web, there is a good chance other operators are too. We will write what we learn."
        primaryLabel="Suggest a topic"
        primaryHref="/contact"
        showPhone={false}
      />
    </>
  )
}
