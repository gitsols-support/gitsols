import type { Metadata } from 'next'
import { Phone, Mail, MapPin, Clock, Activity, type LucideIcon } from 'lucide-react'
import { COMPANY } from '@gitsols/constants'
import LeadForm from '@/components/marketing/LeadForm'
import PageHero from '@/components/marketing/PageHero'

export const metadata: Metadata = {
  title: 'Contact GITSOLS — NJ HQ · 888-503-0666',
  description:
    'Talk to the GITSOLS team. Phone, email, or web form. New Jersey headquartered, supporting medical, financial, and professional services firms nationwide.',
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Talk to the GITSOLS team.
            <br />
            <span className="text-[#14B8A6]">A real engineer replies.</span>
          </>
        }
        subtitle="By phone, by email, or by the form below. We respond within one business day — faster if you call."
      />

      {/* ════════════════════════════════════════════════
          CONTACT GRID + FORM
          ════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-[#D5E0DE]">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:items-start">
            {/* Left rail — contact methods */}
            <div className="lg:col-span-5 space-y-5">
              <ContactBlock
                icon={Phone}
                label="By telephone"
                primary={COMPANY.phone}
                href={`tel:${COMPANY.phoneE164}`}
                helper="24/7 for current clients · business hours for new inquiries"
              />
              <ContactBlock
                icon={Mail}
                label="By electronic post"
                primary={COMPANY.email}
                href={`mailto:${COMPANY.email}`}
                helper="One business day response, always"
              />
              <ContactBlock
                icon={MapPin}
                label="In person"
                primary={COMPANY.address.street}
                helper={`${COMPANY.address.city}, ${COMPANY.address.regionCode} ${COMPANY.address.postalCode}`}
              />
              <ContactBlock
                icon={Clock}
                label="Office hours"
                primary="Mon–Fri · 8 a.m. – 6 p.m. ET"
                helper="After-hours line reserved for current clients with active incidents"
              />

              <div className="relative bg-[#082F2F] rounded-[4px] p-6 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#0F766E] via-[#CFFAFA] to-[#0F766E]" />
                <div className="flex items-center gap-2 text-[#CFFAFA]">
                  <Activity className="w-4 h-4" />
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.22em]">
                    Current client?
                  </p>
                </div>
                <p
                  className="mt-3 font-serif text-[20px] text-white leading-snug tracking-[-0.005em]"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  Open a ticket from your client portal.
                </p>
                <p className="mt-2 text-[13px] text-white/70 leading-relaxed">
                  portal.gitsols.com routes faster than the form here — and
                  preserves the audit trail.
                </p>
              </div>
            </div>

            {/* Right — form */}
            <div className="lg:col-span-7">
              <LeadForm
                source="contact_form"
                heading="A letter to the firm."
                body="Tell us about your environment, your timeline, or the problem you're trying to solve."
                submitLabel="Send the letter"
                showIndustry
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

interface ContactBlockProps {
  icon: LucideIcon
  label: string
  primary: string
  href?: string
  helper?: string
}

function ContactBlock({ icon: Icon, label, primary, href, helper }: ContactBlockProps) {
  const inner = (
    <>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F4C4C]">{label}</p>
      <p
        className="mt-2 font-serif text-[22px] text-[#0F4C4C] leading-snug tracking-[-0.01em] break-words"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        {primary}
      </p>
      {helper && <p className="mt-2 text-[12.5px] text-[#5F6E6D] leading-relaxed">{helper}</p>}
    </>
  )
  return (
    <div className="relative bg-white border border-[#D5E0DE] rounded-[4px] p-6 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#0F766E]/40" />
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-[3px] bg-[#ECFEFE] border border-[#CFFAFA] flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-[#0F4C4C]" />
        </div>
        <div className="flex-1 min-w-0">
          {href ? (
            <a href={href} className="block hover:opacity-80 transition-opacity">
              {inner}
            </a>
          ) : (
            inner
          )}
        </div>
      </div>
    </div>
  )
}
