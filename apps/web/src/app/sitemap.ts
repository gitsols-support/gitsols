// Generated sitemap — fed by @gitsols/constants (services, industries) and
// the MDX content loader (blog, case studies). Adding a service, industry,
// post, or case study automatically updates indexing. Next.js calls this at
// build time and serves it at /sitemap.xml.

import type { MetadataRoute } from 'next'
import { SERVICES, INDUSTRIES } from '@gitsols/constants'
import { env } from '@/env'
import { getPosts, getCaseStudies } from '@/server/content'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  const now = new Date()

  const staticRoutes = [
    { path: '', changeFrequency: 'weekly' as const, priority: 1.0 },
    { path: '/services', changeFrequency: 'monthly' as const, priority: 0.9 },
    { path: '/industries', changeFrequency: 'monthly' as const, priority: 0.9 },
    { path: '/process', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/why-gitsols', changeFrequency: 'monthly' as const, priority: 0.6 },
    { path: '/resources', changeFrequency: 'weekly' as const, priority: 0.5 },
    { path: '/resources/blog', changeFrequency: 'weekly' as const, priority: 0.7 },
    { path: '/resources/case-studies', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/contact', changeFrequency: 'yearly' as const, priority: 0.7 },
    { path: '/free-it-audit', changeFrequency: 'monthly' as const, priority: 0.95 },
    { path: '/privacy', changeFrequency: 'yearly' as const, priority: 0.3 },
    { path: '/terms', changeFrequency: 'yearly' as const, priority: 0.3 },
  ]

  const serviceRoutes = SERVICES.map((s) => ({
    path: `/services/${s.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }))

  const industryRoutes = INDUSTRIES.map((i) => ({
    path: `/industries/${i.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }))

  const blogRoutes = getPosts().map((p) => ({
    path: `/resources/blog/${p.slug}`,
    lastModified: new Date(p.frontmatter.publishedAt),
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }))

  const caseStudyRoutes = getCaseStudies().map((c) => ({
    path: `/resources/case-studies/${c.slug}`,
    lastModified: new Date(c.frontmatter.publishedAt),
    changeFrequency: 'yearly' as const,
    priority: 0.75,
  }))

  return [...staticRoutes, ...serviceRoutes, ...industryRoutes]
    .map((r) => ({
      url: `${base}${r.path}`,
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    }))
    .concat(
      blogRoutes.map((r) => ({
        url: `${base}${r.path}`,
        lastModified: r.lastModified,
        changeFrequency: r.changeFrequency,
        priority: r.priority,
      })),
    )
    .concat(
      caseStudyRoutes.map((r) => ({
        url: `${base}${r.path}`,
        lastModified: r.lastModified,
        changeFrequency: r.changeFrequency,
        priority: r.priority,
      })),
    )
}
