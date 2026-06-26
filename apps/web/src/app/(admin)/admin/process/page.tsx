import type { Metadata } from 'next'
import { PROCESS_STAGES } from '@gitsols/constants'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'

export const metadata: Metadata = { title: 'Engagement lifecycle · Admin' }

export default function AdminProcessPage() {
  return (
    <div className="max-w-[1200px] space-y-6">
      <AdminPageHeader
        eyebrow="Configuration · Process"
        title="Engagement lifecycle"
        description="The nine-stage chronicle that every paid engagement runs through. Edit owners, durations, artifacts, and client visibility — published versions propagate to /process and the engagement-creation flow."
        breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Configuration' }, { label: 'Process' }]}
        stats={[
          { label: 'Stages', value: PROCESS_STAGES.length },
          { label: 'Portal-visible', value: PROCESS_STAGES.filter((s) => s.clientVisibility === 'portal').length },
          { label: 'Internal-only', value: PROCESS_STAGES.filter((s) => s.clientVisibility === 'private').length },
          { label: 'Public URL', value: '/process' },
        ]}
        secondaryAction={{ label: 'View public', href: '/process' }}
      />

      <AdminCard eyebrow="Chronicle" title="All stages" flush>
        <ol>
          {PROCESS_STAGES.map((s, i, arr) => (
            <li
              key={s.number}
              className={`px-6 py-5 ${i < arr.length - 1 ? 'border-b border-[#E5EDEB]' : ''}`}
            >
              <div className="grid grid-cols-[64px_1fr_180px] gap-5 items-start">
                <span
                  className="font-serif text-[36px] text-[#0F4C4C] leading-none tracking-[-0.02em]"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {String(s.number).padStart(2, '0')}
                </span>
                <div>
                  <p
                    className="font-serif text-[20px] text-[#0F4C4C] leading-tight tracking-[-0.01em]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {s.title}
                  </p>
                  <p className="text-[13px] text-[#5F6E6D] mt-2 leading-relaxed max-w-2xl">{s.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {s.artifacts.map((a) => (
                      <span
                        key={a}
                        className="inline-flex items-center font-mono text-[10.5px] uppercase tracking-[0.12em] text-[#0F4C4C] bg-[#ECFEFE] border border-[#CFFAFA] px-2 py-1 rounded-[3px]"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right space-y-1.5">
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#5F6E6D]">
                    Owner · <span className="text-[#0F4C4C]">{s.owner}</span>
                  </p>
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#5F6E6D]">
                    Duration · <span className="text-[#0F4C4C]">{s.duration}</span>
                  </p>
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.18em]">
                    Visibility ·{' '}
                    <span
                      className={
                        s.clientVisibility === 'portal'
                          ? 'text-[#0F766E]'
                          : s.clientVisibility === 'shared'
                            ? 'text-[#C5933A]'
                            : 'text-[#5F6E6D]'
                      }
                    >
                      {s.clientVisibility}
                    </span>
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </AdminCard>
    </div>
  )
}
