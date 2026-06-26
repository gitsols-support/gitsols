import type { Metadata } from 'next'
import { Stethoscope, Landmark, Briefcase, type LucideIcon } from 'lucide-react'
import { INDUSTRIES } from '@gitsols/constants'
import IndustryCard from '@/components/marketing/IndustryCard'
import Cta from '@/components/marketing/Cta'
import PageHero from '@/components/marketing/PageHero'

export const metadata: Metadata = {
  title: 'Industries — Healthcare · Financial · Professional Services',
  description:
    'IT, cybersecurity, and compliance tailored to the regulatory frameworks each industry actually runs under — HIPAA, NYDFS, SEC, FINRA, ABA, GLBA.',
  alternates: { canonical: '/industries' },
}

const industryIcons: Record<string, LucideIcon> = {
  healthcare: Stethoscope,
  'financial-services': Landmark,
  'professional-services': Briefcase,
}

export default function IndustriesIndexPage() {
  return (
    <>
      <PageHero
        eyebrow="Industries"
        title={
          <>
            Compliance language
            <br />
            <span className="text-[#14B8A6]">we speak fluently.</span>
          </>
        }
        subtitle="We win where compliance is the constraint and uptime is the metric — three verticals where every IT decision shows up in an audit, and we know which line."
      />

      {/* ════════════════════════════════════════════════
          INDUSTRY DOSSIERS
          ════════════════════════════════════════════════ */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {INDUSTRIES.map((i, idx) => (
              <IndustryCard
                key={i.slug}
                industry={i}
                icon={industryIcons[i.slug] ?? Briefcase}
                index={idx + 1}
              />
            ))}
          </div>
        </div>
      </section>

      <Cta
        label="Other verticals"
        heading={
          <>
            Operating in another vertical?
            <br />
            <span className="italic text-[#0F766E]">We probably still know it.</span>
          </>
        }
        body="If your industry has compliance teeth — government contractors, biotech, education — get in touch and we'll tell you straight whether we're the right fit."
        primaryLabel="Get in touch"
        primaryHref="/contact"
      />
    </>
  )
}
