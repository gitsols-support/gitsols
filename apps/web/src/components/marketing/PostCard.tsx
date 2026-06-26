import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

interface PostCardProps {
  href: string
  title: string
  description: string
  publishedAt: string
  readingTimeMinutes: number
  eyebrow?: string
  tags?: string[]
}

export default function PostCard({
  href,
  title,
  description,
  publishedAt,
  readingTimeMinutes,
  eyebrow,
  tags,
}: PostCardProps) {
  return (
    <Link
      href={href}
      className="group block bg-white rounded-2xl border border-[#E2E8E8] p-6 hover:border-[#0F4C4C]/30 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        {eyebrow && (
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#14B8A6]/70">
            {eyebrow}
          </p>
        )}
        <ArrowUpRight className="w-4 h-4 text-[#14B8A6] mt-0.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </div>
      <h3 className="mt-3 text-lg font-semibold text-[#0F4C4C] group-hover:text-[#155E5E] leading-snug">
        {title}
      </h3>
      <p className="mt-2 text-sm text-gray-600 leading-relaxed line-clamp-3">{description}</p>
      <div className="mt-5 flex items-center gap-3 text-[11px] text-gray-500">
        <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
        <span aria-hidden>·</span>
        <span>{readingTimeMinutes} min read</span>
      </div>
      {tags && tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="inline-flex items-center text-[10px] font-medium text-[#0F4C4C] bg-[#ECFEFE] px-2 py-0.5 rounded"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}
