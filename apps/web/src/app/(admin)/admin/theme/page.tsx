import type { Metadata } from 'next'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'

export const metadata: Metadata = { title: 'Theme · Admin' }

const PALETTE = [
  { name: 'Primary · Deep teal', hex: '#0F4C4C', token: '--primary', light: false },
  { name: 'Primary light', hex: '#155E5E', token: '--primary-light', light: false },
  { name: 'Primary dark', hex: '#082F2F', token: '--primary-dark', light: false },
  { name: 'Accent · Signal teal', hex: '#14B8A6', token: '--accent', light: false },
  { name: 'Accent dark', hex: '#0F766E', token: '--accent-dark', light: false },
  { name: 'Background', hex: '#F4F8F7', token: '--background', light: true },
  { name: 'Paper', hex: '#FFFFFF', token: '--paper', light: true },
  { name: 'Hairline', hex: '#D5E0DE', token: '--border', light: true },
  { name: 'Ink · 100', hex: '#062524', token: '--foreground', light: false },
  { name: 'Muted', hex: '#5F6E6D', token: '--muted', light: false },
  { name: 'Success', hex: '#14B8A6', token: '--success', light: false },
  { name: 'Warning', hex: '#C5933A', token: '--warning', light: false },
  { name: 'Error', hex: '#B53A2B', token: '--error', light: false },
]

export default function AdminThemePage() {
  return (
    <div className="max-w-[1200px] space-y-6">
      <AdminPageHeader
        eyebrow="Configuration · Tokens"
        title="Theme & design system"
        description="The single source of truth for color, typography, spacing, and surfaces. Edit src/app/globals.css — every page below picks up the change."
        breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Configuration' }, { label: 'Theme' }]}
        stats={[
          { label: 'Tokens', value: 36 },
          { label: 'Type families', value: 3, hint: 'serif / sans / mono' },
          { label: 'Surfaces', value: 4 },
          { label: 'Themes', value: 1, hint: 'light' },
        ]}
      />

      <AdminCard eyebrow="Color" title="Palette" flush>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-[#D5E0DE]">
          {PALETTE.map((c) => (
            <div key={c.hex} className="bg-white p-4">
              <div
                className="aspect-[2/1] rounded-[3px] border border-[#D5E0DE] mb-3 flex items-end justify-end p-2"
                style={{ backgroundColor: c.hex }}
              >
                <span
                  className={`font-mono text-[10px] uppercase tracking-[0.16em] ${c.light ? 'text-[#0F4C4C]' : 'text-white/90'}`}
                >
                  {c.hex}
                </span>
              </div>
              <p className="font-serif text-[14px] text-[#0F4C4C] leading-tight tracking-[-0.005em]" style={{ fontFamily: 'var(--font-serif)' }}>
                {c.name}
              </p>
              <p className="font-mono text-[10.5px] text-[#5F6E6D] mt-0.5">{c.token}</p>
            </div>
          ))}
        </div>
      </AdminCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AdminCard eyebrow="Type" title="Typography">
          <div className="space-y-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F766E] mb-2">
                Display · Instrument Serif
              </p>
              <p className="display-1 text-[#0F4C4C]">Quiet infrastructure.</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F766E] mb-2">
                Display 2
              </p>
              <p className="display-2 text-[#0F4C4C]">A nine-stage chronicle.</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F766E] mb-2">
                Body · Inter
              </p>
              <p className="text-[15px] text-[#062524]/80 leading-relaxed">
                We started GITSOLS to bring enterprise-grade discipline to the practices and firms that had been told they couldn&apos;t afford it.
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F766E] mb-2">
                Mono · JetBrains
              </p>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#0F4C4C]">
                NOC · 24/7 · NOMINAL · MMXXVI
              </p>
            </div>
          </div>
        </AdminCard>

        <AdminCard eyebrow="Patterns" title="Surfaces & rules">
          <div className="space-y-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F766E] mb-2">Paper card</p>
              <div className="card-paper p-4">
                <p className="font-serif text-[16px] text-[#0F4C4C]" style={{ fontFamily: 'var(--font-serif)' }}>Quiet white surface.</p>
                <p className="text-[12px] text-[#5F6E6D] mt-1">Hairline border. Subtle shadow.</p>
              </div>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F766E] mb-2">Editorial card</p>
              <div className="card-editorial p-4">
                <p className="font-serif text-[16px] text-[#0F4C4C]" style={{ fontFamily: 'var(--font-serif)' }}>Brass-rule editorial.</p>
                <p className="text-[12px] text-[#5F6E6D] mt-1">2px top accent · paper tint.</p>
              </div>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F766E] mb-2">Rules</p>
              <hr className="rule-hair my-3" />
              <hr className="rule-brass my-3" />
            </div>
          </div>
        </AdminCard>
      </div>
    </div>
  )
}
