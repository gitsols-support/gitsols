import { Eye, EyeOff, MonitorPlay, Users, Clock4, type LucideIcon } from 'lucide-react'
import type { ProcessStage } from '@gitsols/constants'

interface TimelineProcessProps {
  stages: readonly ProcessStage[]
}

const visibilityConfig: Record<
  ProcessStage['clientVisibility'],
  { label: string; icon: LucideIcon }
> = {
  private: { label: 'Internal only', icon: EyeOff },
  shared: { label: 'Shared by email', icon: Eye },
  portal: { label: 'Live in client portal', icon: MonitorPlay },
}

/**
 * Editorial process timeline — vertical chronicle. A brass rule runs through
 * a column of serif numerals; cards alternate sides on desktop.
 */
export default function TimelineProcess({ stages }: TimelineProcessProps) {
  return (
    <div className="relative">
      {/* Central brass rule */}
      <div
        className="absolute left-[28px] md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#0F766E]/55 to-transparent pointer-events-none"
        aria-hidden
      />

      <ol className="relative space-y-12 md:space-y-20">
        {stages.map((stage, i) => {
          const v = visibilityConfig[stage.clientVisibility]
          const VIcon = v.icon
          const onRight = i % 2 === 1

          return (
            <li
              key={stage.number}
              className="relative grid grid-cols-[56px_1fr] md:grid-cols-2 md:gap-16 items-start"
            >
              {/* Node — serif numeral inside a bone disc */}
              <div
                className={`relative ${
                  onRight ? 'md:order-2 md:justify-self-start md:-translate-x-1/2' : 'md:justify-self-end md:translate-x-1/2'
                }`}
              >
                <div className="relative z-10 w-14 h-14 rounded-full bg-[#F4F8F7] border border-[#D5E0DE] flex items-center justify-center shadow-[0_2px_0_rgba(15,118,110,0.25),0_12px_24px_-12px_rgba(15,76,76,0.25)]">
                  <span
                    className="font-serif text-[22px] text-[#0F4C4C] leading-none tracking-[-0.02em]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {String(stage.number).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Card */}
              <div
                className={`${onRight ? 'md:order-1 md:text-right' : 'md:text-left'} md:max-w-md ${
                  onRight ? 'md:justify-self-end' : 'md:justify-self-start'
                }`}
              >
                <div
                  className={`relative bg-white rounded-[4px] border border-[#D5E0DE] p-7 hover:border-[#0F4C4C]/40 hover:shadow-[0_24px_48px_-24px_rgba(8,47,47,0.20)] transition-all overflow-hidden ${
                    onRight ? 'md:ml-auto' : ''
                  }`}
                >
                  {/* Brass top */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#0F766E]/40" />

                  <div
                    className={`flex items-center gap-3 flex-wrap font-mono text-[10px] uppercase tracking-[0.18em] ${
                      onRight ? 'md:justify-end' : ''
                    }`}
                  >
                    <span className="text-[#0F4C4C]">Chapter {String(stage.number).padStart(2, '0')}</span>
                    <span className="text-[#D5E0DE]">·</span>
                    <span className="inline-flex items-center gap-1 text-[#0F4C4C]">
                      <Clock4 className="w-3 h-3" />
                      {stage.duration}
                    </span>
                    <span className="text-[#D5E0DE]">·</span>
                    <span className="inline-flex items-center gap-1 text-[#5F6E6D]">
                      <Users className="w-3 h-3" />
                      {stage.owner}
                    </span>
                  </div>

                  <h3
                    className="mt-5 font-serif text-[26px] text-[#0F4C4C] leading-tight tracking-[-0.012em]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {stage.title}
                  </h3>
                  <p className="mt-3 text-[14px] text-[#5F6E6D] leading-relaxed">
                    {stage.description}
                  </p>

                  {stage.artifacts.length > 0 && (
                    <>
                      <div className={`mt-5 ${onRight ? 'md:text-right' : ''}`}>
                        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F4C4C]">
                          Artifacts produced
                        </span>
                      </div>
                      <div
                        className={`mt-2.5 flex items-center gap-1.5 flex-wrap ${
                          onRight ? 'md:justify-end' : ''
                        }`}
                      >
                        {stage.artifacts.map((a) => (
                          <span
                            key={a}
                            className="inline-flex items-center text-[11px] font-mono tracking-[0.04em] text-[#0F4C4C] bg-[#ECFEFE] border border-[#D5E0DE] px-2 py-1 rounded-[3px]"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </>
                  )}

                  <div
                    className={`mt-5 inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#5F6E6D] ${
                      onRight ? 'md:float-right' : ''
                    }`}
                  >
                    <VIcon className="w-3.5 h-3.5 text-[#0F4C4C]" />
                    {v.label}
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
