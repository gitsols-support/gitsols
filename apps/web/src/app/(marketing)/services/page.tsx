import type { Metadata } from 'next'
import { SERVICES, SERVICE_CATEGORY_LABELS, type ServiceCategory } from '@gitsols/constants'
import ServiceCard from '@/components/marketing/ServiceCard'
import Cta from '@/components/marketing/Cta'
import PageHero from '@/components/marketing/PageHero'

export const metadata: Metadata = {
  title: 'Services — Managed IT · Cybersecurity · Bespoke Software',
  description:
    'Eight service lines from one accountable team — managed IT, cybersecurity, compliance, cloud, communications, network, and bespoke software development.',
  alternates: { canonical: '/services' },
}

const CATEGORY_ORDER: ServiceCategory[] = [
  'managed',
  'security',
  'cloud',
  'communications',
  'build',
]

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V']

export default function ServicesIndexPage() {
  let serviceIndex = 0

  return (
    <>
      <PageHero
        eyebrow="Services"
        title={
          <>
            Eight service lines.
            <br />
            <span className="text-[#14B8A6]">One accountable team.</span>
          </>
        }
        subtitle="We sell separately and deliver together — so when work crosses boundaries (a phone migration that touches the firewall, an EHR upgrade that needs new endpoints), one team owns the outcome."
      />

      {/* ════════════════════════════════════════════════
          CATEGORIES — chaptered grid
          ════════════════════════════════════════════════ */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-24">
          {CATEGORY_ORDER.map((cat, catIdx) => {
            const items = SERVICES.filter((s) => s.category === cat)
            if (items.length === 0) return null
            const isLast = catIdx === CATEGORY_ORDER.length - 1

            return (
              <div key={cat} className={isLast ? '' : 'mb-16 pb-16 border-b border-[#D5E0DE]'}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
                  <div className="lg:col-span-3">
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#0F4C4C]">
                      Chapter {ROMAN[catIdx + 1]}
                    </p>
                    <h2
                      className="mt-3 font-serif text-[34px] lg:text-[40px] text-[#0F4C4C] leading-[1.05] tracking-[-0.015em]"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      {SERVICE_CATEGORY_LABELS[cat]}
                    </h2>
                    <div className="mt-4 w-12 h-px bg-[#0F766E]" />
                    <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-[#5F6E6D]">
                      {items.length} {items.length === 1 ? 'line' : 'lines'}
                    </p>
                  </div>
                  <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {items.map((s) => {
                      serviceIndex += 1
                      return <ServiceCard key={s.slug} service={s} index={serviceIndex} />
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <Cta
        label="Engagement"
        heading={
          <>
            Not sure where to begin?
            <br />
            <span className="italic text-[#0F766E]">Let us audit what you already have.</span>
          </>
        }
        body="The free IT audit reviews your network, endpoints, backup, and compliance posture. You get a punch list. We get the chance to earn the work."
      />
    </>
  )
}
