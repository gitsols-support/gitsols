import type { Metadata } from 'next'
import { PROCESS_STAGES } from '@gitsols/constants'
import TimelineProcess from '@/components/marketing/TimelineProcess'
import Cta from '@/components/marketing/Cta'
import PageHero from '@/components/marketing/PageHero'
import SectionLabel from '@/components/marketing/SectionLabel'

export const metadata: Metadata = {
  title: 'How we work — Engagement lifecycle from discovery to renewal',
  description:
    'Nine stages, codified — discovery, SoW, kickoff, milestones, approvals, delivery, ongoing operations. Every engagement runs the same way so satisfaction is measured, not assumed.',
  alternates: { canonical: '/process' },
}

export default function ProcessPage() {
  const stageCount = PROCESS_STAGES.length
  const portalStages = PROCESS_STAGES.filter((s) => s.clientVisibility === 'portal').length

  return (
    <>
      <PageHero
        eyebrow="The engagement"
        title={
          <>
            A {stageCount}-stage chronicle.
            <br />
            <span className="text-[#14B8A6]">Discovery to renewal.</span>
          </>
        }
        subtitle={`Every engagement runs the same way — ${stageCount} stages, ${portalStages} of them live in your client portal. Discovery typically 1–3 weeks; first milestone within 30 days.`}
      />

      {/* ════════════════════════════════════════════════
          TIMELINE
          ════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-[#D5E0DE]">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <SectionLabel rule>The chronicle</SectionLabel>
            <h2
              className="mt-5 font-serif text-[#0F4C4C] leading-[1.04] tracking-[-0.018em]"
              style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)' }}
            >
              Each chapter, in order.
            </h2>
            <p className="mt-5 text-[14.5px] text-[#5F6E6D] leading-relaxed">
              Chapters one through three happen in correspondence. Chapter four
              onward, you have the receipts — live, in your portal.
            </p>
          </div>
          <TimelineProcess stages={PROCESS_STAGES} />
        </div>
      </section>

      <Cta
        label="Stage I"
        heading={
          <>
            Ready to run an engagement?
            <br />
            <span className="italic text-[#0F766E]">Stage one starts with a free IT audit.</span>
          </>
        }
        body="Sixty minutes, no obligation. We document what you have, identify gaps, and tell you whether the engagement should move to stage two — discovery."
      />
    </>
  )
}
