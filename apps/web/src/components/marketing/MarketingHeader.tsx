'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, Phone, ArrowUpRight, ChevronDown } from 'lucide-react'
import { COMPANY, SERVICES, INDUSTRIES, SERVICE_CATEGORY_LABELS } from '@gitsols/constants'
import Wordmark from './Wordmark'

/**
 * Editorial marketing header — refined corporate masthead with a thin top
 * meta rail (phone, hours, "client portal" link), a main bar with the
 * GITSOLS wordmark and primary nav, and a categorized services mega-menu.
 */
export default function MarketingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Group services by category for the mega-menu
  type Svc = (typeof SERVICES)[number]
  const grouped = SERVICES.reduce<Record<string, Svc[]>>((acc, s) => {
    ;(acc[s.category] ??= []).push(s)
    return acc
  }, {})

  return (
    <header className="sticky top-0 z-30">
      {/* Top meta rail */}
      <div className="hidden md:block bg-[#082F2F] text-white/70 text-[11px]">
        <div className="max-w-7xl mx-auto px-6 h-8 flex items-center justify-between">
          <div className="flex items-center gap-5 font-mono">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6] animate-pulse" />
              <span className="uppercase tracking-[0.18em]">NOC · 24/7 monitoring active</span>
            </span>
            <span className="hidden lg:inline text-white/40">·</span>
            <span className="hidden lg:inline uppercase tracking-[0.18em] text-white/50">
              {COMPANY.serviceArea}
            </span>
          </div>
          <div className="flex items-center gap-5 font-mono">
            <a href={`tel:${COMPANY.phoneE164}`} className="hover:text-white transition-colors">
              {COMPANY.phone}
            </a>
            <span className="text-white/30">·</span>
            <a href={`mailto:${COMPANY.email}`} className="hover:text-white transition-colors">
              {COMPANY.email}
            </a>
            <span className="text-white/30">·</span>
            <Link href="/portal" className="hover:text-white transition-colors uppercase tracking-[0.14em]">
              Client portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div
        className={`backdrop-blur-md bg-[#F4F8F7]/92 border-b transition-all ${
          scrolled
            ? 'border-[#D5E0DE] shadow-[0_1px_0_rgba(6,37,36,0.04)]'
            : 'border-[#D5E0DE]/70'
        }`}
      >
        <div className="max-w-7xl mx-auto h-[68px] px-6 flex items-center justify-between gap-6">
          <Link href="/" className="shrink-0">
            <Wordmark tone="light" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-7">
            <div
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button
                type="button"
                className="inline-flex items-center gap-1 text-[13.5px] font-medium text-[#0F4C4C] hover:text-[#082F2F] transition-colors py-2"
              >
                Services
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
              </button>
              {servicesOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-[760px] animate-fade-in">
                  <div className="relative bg-white border border-[#D5E0DE] rounded-md shadow-[0_30px_60px_-20px_rgba(8,47,47,0.25)] overflow-hidden">
                    {/* Brass top rule */}
                    <div className="h-[2px] bg-gradient-to-r from-[#0F766E] via-[#0F4C4C] to-[#0F766E]" />
                    <div className="p-6 grid grid-cols-2 gap-x-8 gap-y-1">
                      {Object.entries(grouped).map(([cat, items]) => (
                        <div key={cat} className="py-2">
                          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F4C4C] mb-3 pb-2 border-b border-[#E5EDEB]">
                            {SERVICE_CATEGORY_LABELS[cat as keyof typeof SERVICE_CATEGORY_LABELS]}
                          </div>
                          <ul className="space-y-0.5">
                            {items.map((s) => (
                              <li key={s.slug}>
                                <Link
                                  href={`/services/${s.slug}`}
                                  className="group block py-1.5 -mx-2 px-2 rounded hover:bg-[#F4F8F7] transition-colors"
                                >
                                  <span className="block text-[14px] font-semibold text-[#0F4C4C] group-hover:text-[#082F2F]">
                                    {s.shortName ?? s.name}
                                  </span>
                                  <span className="block text-[12px] text-[#5F6E6D] line-clamp-1">
                                    {s.tagline}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-[#E5EDEB] bg-[#F4F8F7] px-6 py-3.5 flex items-center justify-between">
                      <span className="font-serif italic text-[14px] text-[#0F4C4C]">
                        Cross-domain engagements? One accountable team.
                      </span>
                      <Link
                        href="/services"
                        className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#0F4C4C] hover:text-[#082F2F]"
                      >
                        All services <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link href="/industries" className="text-[13.5px] font-medium text-[#0F4C4C] hover:text-[#082F2F]">
              Industries
            </Link>
            <Link href="/process" className="text-[13.5px] font-medium text-[#0F4C4C] hover:text-[#082F2F]">
              Process
            </Link>
            <Link href="/why-gitsols" className="text-[13.5px] font-medium text-[#0F4C4C] hover:text-[#082F2F]">
              Why GITSOLS
            </Link>
            <Link href="/resources" className="text-[13.5px] font-medium text-[#0F4C4C] hover:text-[#082F2F]">
              Insights
            </Link>
            <Link href="/contact" className="text-[13.5px] font-medium text-[#0F4C4C] hover:text-[#082F2F]">
              Contact
            </Link>
          </nav>

          {/* Right rail */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/free-it-audit"
              className="hidden sm:inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white bg-[#0F4C4C] hover:bg-[#082F2F] pl-4 pr-3.5 py-2.5 rounded-[3px] transition-colors border border-[#082F2F] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
            >
              Request an audit
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              className="lg:hidden w-10 h-10 rounded text-[#0F4C4C] hover:bg-[#E5EDEB] flex items-center justify-center"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {/* Hairline indicator under main bar */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-[#0F766E]/40 to-transparent" />
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-b border-[#D5E0DE] bg-white animate-fade-in shadow-md">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
            <details className="group border-b border-[#E5EDEB] pb-2">
              <summary className="cursor-pointer text-[14px] font-semibold text-[#0F4C4C] py-2.5 list-none flex items-center justify-between">
                Services
                <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="pl-3 py-1 flex flex-col gap-0.5">
                {SERVICES.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/services/${s.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="text-[13px] text-[#0F4C4C]/80 py-1.5"
                  >
                    {s.shortName ?? s.name}
                  </Link>
                ))}
              </div>
            </details>
            <details className="group border-b border-[#E5EDEB] pb-2">
              <summary className="cursor-pointer text-[14px] font-semibold text-[#0F4C4C] py-2.5 list-none flex items-center justify-between">
                Industries
                <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="pl-3 py-1 flex flex-col gap-0.5">
                {INDUSTRIES.map((i) => (
                  <Link
                    key={i.slug}
                    href={`/industries/${i.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="text-[13px] text-[#0F4C4C]/80 py-1.5"
                  >
                    {i.name}
                  </Link>
                ))}
              </div>
            </details>
            <Link href="/process" onClick={() => setMobileOpen(false)} className="text-[14px] font-semibold text-[#0F4C4C] py-2.5 border-b border-[#E5EDEB]">
              Process
            </Link>
            <Link href="/why-gitsols" onClick={() => setMobileOpen(false)} className="text-[14px] font-semibold text-[#0F4C4C] py-2.5 border-b border-[#E5EDEB]">
              Why GITSOLS
            </Link>
            <Link href="/resources" onClick={() => setMobileOpen(false)} className="text-[14px] font-semibold text-[#0F4C4C] py-2.5 border-b border-[#E5EDEB]">
              Insights
            </Link>
            <Link href="/contact" onClick={() => setMobileOpen(false)} className="text-[14px] font-semibold text-[#0F4C4C] py-2.5">
              Contact
            </Link>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <a href={`tel:${COMPANY.phoneE164}`} className="inline-flex items-center justify-center gap-1.5 text-[12.5px] font-semibold text-[#0F4C4C] border border-[#D5E0DE] px-4 py-2.5 rounded">
                <Phone className="w-3.5 h-3.5" />
                Call us
              </a>
              <Link href="/free-it-audit" onClick={() => setMobileOpen(false)} className="inline-flex items-center justify-center gap-1.5 text-[12.5px] font-semibold text-white bg-[#0F4C4C] hover:bg-[#082F2F] px-4 py-2.5 rounded">
                Request audit
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
