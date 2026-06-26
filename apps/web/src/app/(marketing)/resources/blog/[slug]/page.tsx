import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import SectionLabel from '@/components/marketing/SectionLabel'
import MdxBody from '@/components/marketing/MdxBody'
import PostCard from '@/components/marketing/PostCard'
import Cta from '@/components/marketing/Cta'
import { getPostBySlug, getPosts } from '@/server/content'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams(): { slug: string }[] {
  return getPosts().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    alternates: { canonical: `/resources/blog/${post.slug}` },
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      type: 'article',
      publishedTime: post.frontmatter.publishedAt,
      authors: [post.frontmatter.author],
      tags: post.frontmatter.tags,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const fm = post.frontmatter
  const related = getPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3)

  return (
    <>
      <article className="bg-white">
        <header className="border-b border-[#E2E8E8]">
          <div className="max-w-3xl mx-auto px-6 pt-14 pb-10">
            <Link
              href="/resources/blog"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0F4C4C]/70 hover:text-[#0F4C4C] mb-6"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to blog
            </Link>
            <SectionLabel>Blog</SectionLabel>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-[#0F4C4C] leading-[1.15]">
              {fm.title}
            </h1>
            <p className="mt-4 text-lg text-[#042F2E]/75 leading-relaxed">{fm.description}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span className="text-[#0F4C4C] font-medium">{fm.author}</span>
              <span aria-hidden>·</span>
              <time dateTime={fm.publishedAt}>{formatDate(fm.publishedAt)}</time>
              <span aria-hidden>·</span>
              <span>{post.readingTimeMinutes} min read</span>
            </div>
            {fm.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-1.5">
                {fm.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center text-[10px] font-medium text-[#0F4C4C] bg-[#ECFEFE] px-2 py-0.5 rounded"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-6 py-12">
          <MdxBody source={post.body} />
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-[#E2E8E8] bg-white">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <SectionLabel>Keep reading</SectionLabel>
            <h2 className="mt-2 text-2xl font-bold text-[#0F4C4C] mb-8">
              More from the GITSOLS team.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((p) => (
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

      <Cta
        heading={
          <>
            Found this useful?
            <br />
            <span className="text-white/70">There&apos;s more where it came from.</span>
          </>
        }
        body="The free IT audit applies the same level of detail to your environment. 60 minutes, written findings, yours to keep."
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
