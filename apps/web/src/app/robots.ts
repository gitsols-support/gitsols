import type { MetadataRoute } from 'next'
import { env } from '@/env'

/**
 * robots.txt — disallow admin + portal subdomains and api routes, allow the
 * rest. The sitemap reference is normalized against NEXT_PUBLIC_SITE_URL so
 * staging environments don't end up advertising production URLs.
 */
export default function robots(): MetadataRoute.Robots {
  const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
