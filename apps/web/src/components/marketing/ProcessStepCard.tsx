import { Eye, EyeOff, MonitorPlay } from 'lucide-react'
import type { ProcessStage } from '@gitsols/constants'

interface ProcessStepCardProps {
  stage: ProcessStage
}

const visibilityCopy: Record<
  ProcessStage['clientVisibility'],
  { label: string; icon: typeof Eye }
> = {
  private: { label: 'Internal only', icon: EyeOff },
  shared: { label: 'Shared via email', icon: Eye },
  portal: { label: 'Live in client portal', icon: MonitorPlay },
}

export default function ProcessStepCard({ stage }: ProcessStepCardProps) {
  const v = visibilityCopy[stage.clientVisibility]
  const VIcon = v.icon
  return (
    <div className="relative bg-white rounded-[4px] border border-[#D5E0DE] p-7 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#0F766E]/40" />
      <div className="flex items-start gap-5">
        <div className="flex-shrink-0">
          <span
            className="font-serif text-[44px] leading-none text-[#0F4C4C] tracking-[-0.02em]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {String(stage.number).padStart(2, '0')}
          </span>
          <div className="mt-2 w-9 h-px bg-[#0F766E]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <h3
              className="font-serif text-[22px] text-[#0F4C4C] leading-tight tracking-[-0.01em]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {stage.title}
            </h3>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F4C4C]">
              {stage.duration}
            </span>
          </div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#5F6E6D] mt-2">
            Owner · <span className="text-[#0F4C4C]">{stage.owner}</span>
          </p>
          <p className="mt-4 text-[13.5px] text-[#5F6E6D] leading-relaxed">
            {stage.description}
          </p>

          {stage.artifacts.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-1.5">
              {stage.artifacts.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center text-[11px] font-mono tracking-[0.04em] text-[#0F4C4C] bg-[#ECFEFE] border border-[#D5E0DE] px-2 py-1 rounded-[3px]"
                >
                  {a}
                </span>
              ))}
            </div>
          )}

          <div className="mt-5 inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#5F6E6D]">
            <VIcon className="w-3.5 h-3.5 text-[#0F4C4C]" />
            {v.label}
          </div>
        </div>
      </div>
    </div>
  )
}
