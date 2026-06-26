import Link from 'next/link'
import { Phone, MapPin, Mail, ArrowUpRight } from 'lucide-react'
import { COMPANY, SERVICES, INDUSTRIES } from '@gitsols/constants'
import Wordmark from './Wordmark'
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  YoutubeIcon,
} from './SocialIcons'

/**
 * Editorial footer — colophon-style. Large serif lockup, brass divider rules,
 * grouped navigation, registered office block, compliance attestation row.
 */
export default function MarketingFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative bg-[#082F2F] text-white overflow-hidden">
      {/* Brass top rule */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-[#0F766E] to-transparent" />

      {/* Engraved background grid */}
      <div className="absolute inset-0 bg-grid-dark opacity-[0.5] pointer-events-none" aria-hidden="true" />
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(circle at 8% 0%, rgba(20,184,166,0.10) 0%, transparent 35%), radial-gradient(circle at 95% 100%, rgba(15,118,110,0.08) 0%, transparent 40%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-10">
        {/* Editorial header — wordmark + tagline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          <div className="lg:col-span-5">
            <Link href="/" className="inline-flex items-center" aria-label="GITSOLS — home">
              <Wordmark tone="dark" height={56} />
            </Link>

            <p
              className="mt-8 font-serif italic text-xl text-white/90 leading-snug max-w-md"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              "Quiet infrastructure for regulated industries — paged before
              you notice, audited before it's asked."
            </p>

            <div className="mt-8 flex items-center gap-2">
              {[
                { href: COMPANY.social.linkedin, Icon: LinkedinIcon, label: 'LinkedIn' },
                { href: COMPANY.social.facebook, Icon: FacebookIcon, label: 'Facebook' },
                { href: COMPANY.social.instagram, Icon: InstagramIcon, label: 'Instagram' },
                { href: COMPANY.social.youtube, Icon: YoutubeIcon, label: 'YouTube' },
              ].map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="w-9 h-9 rounded-[3px] border border-white/15 hover:border-[#0F766E] hover:bg-white/5 flex items-center justify-center text-white/70 hover:text-[#0F766E] transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Audit CTA panel */}
          <div className="lg:col-span-7 lg:pl-10 lg:border-l border-white/10">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F766E]">
              Considering a switch?
            </p>
            <h3
              className="mt-3 font-serif text-3xl md:text-4xl text-white leading-[1.05]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Request a confidential 60-minute IT audit.
            </h3>
            <p className="mt-4 text-[13.5px] text-white/60 max-w-lg leading-relaxed">
              A senior engineer reviews your network, endpoints, backup posture,
              and compliance gaps — then hands you a written punch list. Yours
              to keep. No sales follow-up unless you ask.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/free-it-audit"
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#082F2F] bg-[#0F766E] hover:bg-[#CFFAFA] px-5 py-3 rounded-[3px] transition-colors"
              >
                Request the audit
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <a
                href={`tel:${COMPANY.phoneE164}`}
                className="inline-flex items-center gap-2 text-[13px] font-semibold text-white border border-white/20 hover:bg-white/5 px-5 py-3 rounded-[3px] transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                {COMPANY.phone}
              </a>
            </div>
          </div>
        </div>

        {/* Site map columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-10 pt-12">
          <FooterCol label="Services">
            {SERVICES.map((s) => (
              <FooterLink key={s.slug} href={`/services/${s.slug}`}>
                {s.shortName ?? s.name}
              </FooterLink>
            ))}
          </FooterCol>

          <FooterCol label="Industries">
            {INDUSTRIES.map((i) => (
              <FooterLink key={i.slug} href={`/industries/${i.slug}`}>
                {i.shortName ?? i.name}
              </FooterLink>
            ))}
          </FooterCol>

          <FooterCol label="Firm">
            <FooterLink href="/why-gitsols">Why GITSOLS</FooterLink>
            <FooterLink href="/process">Our process</FooterLink>
            <FooterLink href="/resources">Insights</FooterLink>
            <FooterLink href="/resources/case-studies">Case studies</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
          </FooterCol>

          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F766E] mb-4">
              Registered Office
            </p>
            <address className="not-italic text-[13px] text-white/75 leading-relaxed">
              {COMPANY.legalName}
              <br />
              {COMPANY.address.street}
              <br />
              {COMPANY.address.city}, {COMPANY.address.regionCode}{' '}
              {COMPANY.address.postalCode}
              <br />
              {COMPANY.address.countryCode}
            </address>
            <ul className="mt-5 space-y-2.5 text-[13px] text-white/75">
              <li className="flex items-start gap-2.5">
                <Phone className="w-3.5 h-3.5 mt-1 flex-shrink-0 text-[#0F766E]" />
                <a href={`tel:${COMPANY.phoneE164}`} className="hover:text-white transition-colors">
                  {COMPANY.phone}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-3.5 h-3.5 mt-1 flex-shrink-0 text-[#0F766E]" />
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="hover:text-white transition-colors break-all"
                >
                  {COMPANY.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 mt-1 flex-shrink-0 text-[#0F766E]" />
                <span>{COMPANY.serviceArea}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Compliance attestation row */}
        <div className="mt-14 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F766E] whitespace-nowrap">
              Frameworks we operate under
            </span>
            <span className="hidden md:block flex-1 h-px bg-gradient-to-r from-[#0F766E]/40 to-transparent" />
          </div>
          <div className="flex flex-wrap gap-2">
            {['HIPAA', 'SOC 2 Type II', 'NIST CSF', 'PCI-DSS', 'CIS Controls v8', 'GLBA'].map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.12em] text-white/80 border border-white/15 bg-white/[0.03] px-2.5 py-1.5 rounded-[3px]"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Colophon — bottom rail */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-white/45 font-mono">
          <p className="uppercase tracking-[0.14em]">
            © {year} {COMPANY.legalName} · All rights reserved · Set in Instrument Serif & Inter
          </p>
          <div className="flex items-center gap-5 uppercase tracking-[0.14em]">
            <Link href="/privacy" className="hover:text-white/80 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white/80 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F766E] mb-4">
        {label}
      </p>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-[13px] text-white/70 hover:text-white transition-colors"
      >
        {children}
      </Link>
    </li>
  )
}
