import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { COMPANY, SERVICES } from '@gitsols/constants'
import { env } from '@/env'
import './globals.css'

// ── Typography ──────────────────────────────────────────────────────────
//
// One family for sans + display: Geist. Vercel's modern neutral grotesque —
// reads as clean and authoritative without the industrial heft of Archivo.
// We use lighter weights for display (500-600 sweet spot) instead of pairing
// a separate face. Geist Mono handles labels + data.
//
// One typography family = one font load, fewer bytes, cleaner cascade.
//
// CSS-variable names are intentionally unchanged (`--font-serif-display`,
// `--font-sans-body`, `--font-mono`) so existing `var(--font-serif)` and
// `font-serif` references in components continue to render the display face
// without a codebase-wide rename. The "serif" name is semantically loose
// now; treat it as "display."

const sans = localFont({
  src: '../fonts/Geist-Variable.woff2',
  variable: '--font-sans-body',
  weight: '100 900',
  display: 'swap',
})

// Same family powers the display variable — Geist at heavier weights.
const display = localFont({
  src: '../fonts/Geist-Variable.woff2',
  variable: '--font-serif-display',
  weight: '100 900',
  display: 'swap',
})

const mono = localFont({
  src: '../fonts/GeistMono-Variable.woff2',
  variable: '--font-mono',
  weight: '100 900',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: 'GITSOLS — Managed IT, Cybersecurity & Bespoke Software',
    template: '%s · GITSOLS',
  },
  description:
    'GITSOLS LLC — New Jersey MSP for medical, financial, and professional services. Managed IT, cybersecurity, compliance (HIPAA / SOC 2 / NIST), and bespoke software development.',
  openGraph: {
    type: 'website',
    siteName: 'GITSOLS',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@gitsols',
  },
  icons: {
    icon: '/favicon.ico',
  },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'LocalBusiness', 'ProfessionalService'],
  '@id': `${env.NEXT_PUBLIC_SITE_URL}#org`,
  name: COMPANY.legalName,
  alternateName: COMPANY.brand,
  legalName: COMPANY.legalName,
  url: env.NEXT_PUBLIC_SITE_URL,
  telephone: COMPANY.phone,
  email: COMPANY.email,
  founder: { '@type': 'Person', name: COMPANY.founder },
  foundingDate: COMPANY.founded,
  address: {
    '@type': 'PostalAddress',
    streetAddress: COMPANY.address.street,
    addressLocality: COMPANY.address.city,
    addressRegion: COMPANY.address.regionCode,
    postalCode: COMPANY.address.postalCode,
    addressCountry: COMPANY.address.countryCode,
  },
  areaServed: [
    { '@type': 'State', name: 'New Jersey' },
    { '@type': 'Country', name: 'United States' },
  ],
  sameAs: [
    COMPANY.social.linkedin,
    COMPANY.social.facebook,
    COMPANY.social.instagram,
    COMPANY.social.youtube,
  ],
  knowsAbout: [
    'Managed IT Services',
    'Cybersecurity',
    'HIPAA Compliance',
    'SOC 2 Compliance',
    'NIST Cybersecurity Framework',
    'Microsoft Azure',
    'Bespoke Software Development',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'GITSOLS Services',
    itemListElement: SERVICES.map((s) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: s.name,
        description: s.summary,
        url: `${env.NEXT_PUBLIC_SITE_URL}/services/${s.slug}`,
      },
    })),
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body>
        {children}
        {/* Organization / LocalBusiness JSON-LD — emitted once at root. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </body>
    </html>
  )
}
