import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@gitsols/constants', '@gitsols/types', '@gitsols/utils'],
  // Next.js 16: typedRoutes is stable. Currently OFF — the legacy marketing
  // site + shell components (sidebar, footer, topbar) pass plain `string`
  // hrefs to <Link>, which the opt-in compile-time route check rejects.
  // Re-enable and migrate those hrefs to typed `Route`s incrementally; the
  // admin pages already cast dynamic hrefs `as never` so they're ready.
  typedRoutes: false,
}

export default nextConfig
