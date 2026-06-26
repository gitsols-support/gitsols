import type { Metadata } from 'next'
import { Shield, Mail, CalendarClock, CreditCard, MessageSquare, Cloud, type LucideIcon } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'

export const metadata: Metadata = { title: 'Settings · Admin' }

const INTEGRATIONS: { name: string; icon: LucideIcon; connected: boolean; note: string }[] = [
  { name: 'Microsoft 365 · Graph', icon: Mail, connected: true, note: 'Two-way email + calendar sync' },
  { name: 'Google Workspace', icon: Mail, connected: false, note: 'For Google-shop clients' },
  { name: 'QuickBooks Online', icon: CreditCard, connected: true, note: 'Invoice sync · MRR feed' },
  { name: 'Stripe', icon: CreditCard, connected: true, note: 'Payments · client portal' },
  { name: 'Cal.com', icon: CalendarClock, connected: true, note: 'Public booking links' },
  { name: 'Slack', icon: MessageSquare, connected: false, note: 'Optional · ticket alerts' },
  { name: 'AWS R2 / S3', icon: Cloud, connected: true, note: 'Document storage' },
  { name: 'Anthropic', icon: Shield, connected: true, note: 'Ticket triage AI · scoping' },
]

export default function AdminSettingsPage() {
  return (
    <div className="max-w-[1200px] space-y-6">
      <AdminPageHeader
        eyebrow="Configuration · Firm"
        title="Settings"
        description="Firm-wide configuration: branding, audit logging, integrations, billing handoff, security posture."
        breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Configuration' }, { label: 'Settings' }]}
        stats={[
          { label: 'Integrations', value: `${INTEGRATIONS.filter((i) => i.connected).length}/${INTEGRATIONS.length}`, hint: 'connected' },
          { label: 'Audit log · 30d', value: '12,481', hint: 'events' },
          { label: 'Active sessions', value: 4 },
          { label: 'Encryption', value: 'AES-256', hint: 'at-rest' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AdminCard eyebrow="Firm" title="Branding & details">
          <div className="space-y-4">
            <Field label="Firm name" value="GITSOLS LLC" />
            <Field label="Trading as" value="GITSOLS" />
            <Field label="Primary domain" value="gitsols.com" />
            <Field label="Email · transactional" value="no-reply@gitsols.com" />
            <Field label="Registered office" value="1100 Cornwall Rd, Suite 200, South Brunswick, NJ 08852" />
          </div>
        </AdminCard>

        <AdminCard eyebrow="Security" title="Posture">
          <ul className="space-y-2.5">
            {[
              { label: 'MFA enforced · staff', value: 'Yes' },
              { label: 'Session timeout', value: '30 minutes idle' },
              { label: 'Audit log retention', value: '7 years (HIPAA)' },
              { label: 'Backup retention', value: 'Daily 30d · Monthly 12mo' },
              { label: 'PII encryption at rest', value: 'AES-256 GCM' },
              { label: 'PII encryption in transit', value: 'TLS 1.3' },
              { label: 'SOC 2 Type II', value: 'In-progress (Q4 2026)' },
            ].map((row) => (
              <li key={row.label} className="flex items-baseline justify-between gap-4 pb-2 border-b border-dotted border-[#D5E0DE] last:border-0">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#5F6E6D]">
                  {row.label}
                </span>
                <span className="font-serif text-[14px] text-[#0F4C4C] tracking-[-0.005em] text-right" style={{ fontFamily: 'var(--font-serif)' }}>
                  {row.value}
                </span>
              </li>
            ))}
          </ul>
        </AdminCard>
      </div>

      <AdminCard eyebrow="Connections" title="Integrations" flush>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#D5E0DE]">
          {INTEGRATIONS.map((it) => {
            const Icon = it.icon
            return (
              <div key={it.name} className="bg-white p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-[3px] bg-[#F4F8F7] border border-[#D5E0DE] flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#0F4C4C]" />
                  </div>
                  <span className={`font-mono text-[10px] uppercase tracking-[0.18em] px-2 py-1 rounded-[3px] border ${it.connected ? 'bg-[#0F4C4C] text-white border-[#0F766E]' : 'bg-[#F4F8F7] text-[#5F6E6D] border-[#D5E0DE]'}`}>
                    {it.connected ? 'Connected' : 'Off'}
                  </span>
                </div>
                <p className="font-serif text-[15.5px] text-[#0F4C4C] leading-tight tracking-[-0.005em]" style={{ fontFamily: 'var(--font-serif)' }}>
                  {it.name}
                </p>
                <p className="text-[12px] text-[#5F6E6D] mt-1.5 leading-relaxed">{it.note}</p>
              </div>
            )
          })}
        </div>
      </AdminCard>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5 block">
        {label}
      </label>
      <input type="text" defaultValue={value} readOnly className="input" />
    </div>
  )
}
