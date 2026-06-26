import type { Metadata } from 'next'
import Link from 'next/link'
import { PackageOpen, Plus, ArrowUpRight, ExternalLink, Filter } from 'lucide-react'
import { SERVICES, SERVICE_CATEGORY_LABELS, type ServiceCategory } from '@gitsols/constants'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { getServiceIcon } from '@/components/marketing/service-icons'

export const metadata: Metadata = {
  title: 'Service catalog · Admin',
}

const CATEGORY_ORDER: ServiceCategory[] = [
  'managed',
  'security',
  'cloud',
  'communications',
  'build',
]

// Stub commercial fields — these will live on ServiceCatalogItem records in
// the DB once the API ships. For now they're representative defaults so the
// admin UI looks real.
const COMMERCIAL: Record<string, { billing: string; price: string; status: 'live' | 'draft' }> = {
  'managed-it': { billing: 'MRR', price: '$120/seat/mo', status: 'live' },
  cybersecurity: { billing: 'MRR', price: '$45/seat/mo', status: 'live' },
  compliance: { billing: 'Fixed', price: '$18k base · scoped', status: 'live' },
  cloud: { billing: 'MRR', price: '$95/seat/mo + usage', status: 'live' },
  'business-phone': { billing: 'MRR', price: '$28/seat/mo', status: 'live' },
  communications: { billing: 'MRR', price: '$35/seat/mo', status: 'live' },
  network: { billing: 'Project', price: 'T&M · scoped', status: 'live' },
  'bespoke-software': { billing: 'Fixed / T&M', price: 'Discovery $12k · build scoped', status: 'live' },
}

export default function AdminServicesPage() {
  return (
    <div className="max-w-[1400px] space-y-6">
      <AdminPageHeader
        eyebrow="Library · Service catalog"
        title="Service catalog"
        description="Definitions of every offering — taglines, capabilities, commercial terms, and milestone templates. Changes published here propagate to the marketing site and the engagement-creation flow."
        badge={{ label: 'Phase 1 · constants-backed', tone: 'warn' }}
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Library' },
          { label: 'Service catalog' },
        ]}
        stats={[
          { label: 'Lines', value: SERVICES.length, hint: 'all published' },
          { label: 'MRR lines', value: 5, hint: 'recurring' },
          { label: 'Fixed-price', value: 2, hint: 'project' },
          { label: 'Categories', value: CATEGORY_ORDER.length },
        ]}
        primaryAction={{ label: 'Add service line', href: '/admin/services/new', icon: Plus }}
        secondaryAction={{ label: 'Open public catalog', href: '/services' }}
      />

      <AdminCard
        eyebrow="Filters"
        title="Filter the catalog"
        action={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#0F4C4C] border border-[#D5E0DE] bg-white hover:border-[#0F4C4C]/40 px-3 py-1.5 rounded-[3px] transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            Customize
          </button>
        }
      >
        <div className="flex flex-wrap gap-2">
          {CATEGORY_ORDER.map((cat) => {
            const count = SERVICES.filter((s) => s.category === cat).length
            return (
              <span
                key={cat}
                className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[#0F4C4C] bg-[#F4F8F7] border border-[#D5E0DE] px-3 py-1.5 rounded-[3px]"
              >
                {SERVICE_CATEGORY_LABELS[cat]}
                <span className="text-[#0F766E]">{count}</span>
              </span>
            )
          })}
        </div>
      </AdminCard>

      {/* Catalog table */}
      <AdminCard eyebrow="The lines" title="Catalog" flush>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-[#F4F8F7] border-b border-[#D5E0DE]">
              <tr className="text-left">
                <Th className="w-12">№</Th>
                <Th>Service line</Th>
                <Th>Category</Th>
                <Th>Billing</Th>
                <Th>Price anchor</Th>
                <Th className="text-center">Capabilities</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {SERVICES.map((s, i) => {
                const Icon = getServiceIcon(s.slug)
                const c = COMMERCIAL[s.slug]
                return (
                  <tr key={s.slug} className="border-b border-[#E5EDEB] hover:bg-[#F4F8F7]/50 transition-colors">
                    <Td className="text-[#5F6E6D] font-mono">{String(i + 1).padStart(2, '0')}</Td>
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-[3px] bg-[#F4F8F7] border border-[#D5E0DE] flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-[#0F4C4C]" />
                        </div>
                        <div>
                          <p
                            className="font-serif text-[16px] text-[#0F4C4C] leading-tight tracking-[-0.005em]"
                            style={{ fontFamily: 'var(--font-serif)' }}
                          >
                            {s.name}
                          </p>
                          <p className="text-[11.5px] text-[#5F6E6D] mt-0.5 leading-tight">
                            {s.tagline}
                          </p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <span className="inline-flex items-center font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#0F4C4C] bg-[#ECFEFE] border border-[#CFFAFA] px-2 py-1 rounded-[3px]">
                        {SERVICE_CATEGORY_LABELS[s.category]}
                      </span>
                    </Td>
                    <Td className="font-mono text-[11.5px] uppercase tracking-[0.14em] text-[#5F6E6D]">
                      {c?.billing ?? '—'}
                    </Td>
                    <Td className="text-[#062524]/85">{c?.price ?? '—'}</Td>
                    <Td className="text-center">
                      <span className="font-serif text-[18px] text-[#0F4C4C]" style={{ fontFamily: 'var(--font-serif)' }}>
                        {s.capabilities.length}
                      </span>
                    </Td>
                    <Td>
                      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#0F4C4C]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6]" />
                        Live
                      </span>
                    </Td>
                    <Td className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/services/${s.slug}`}
                          target="_blank"
                          className="inline-flex items-center justify-center w-7 h-7 rounded-[3px] border border-[#D5E0DE] hover:border-[#0F4C4C]/40 text-[#5F6E6D] hover:text-[#0F4C4C] transition-colors"
                          aria-label="Open public page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/admin/services/${s.slug}`}
                          className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[#0F4C4C] hover:text-[#082F2F]"
                        >
                          Edit
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {/* Templates row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AdminCard
          eyebrow="Milestone templates"
          title="Default plans per line"
          description="Each catalog item carries a default milestone plan that pre-populates new engagements. Edit a template to change the starting point for every future engagement."
        >
          <ul className="space-y-2">
            {SERVICES.slice(0, 4).map((s) => (
              <li
                key={s.slug}
                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-[3px] border border-[#D5E0DE] bg-[#F4F8F7]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <PackageOpen className="w-3.5 h-3.5 text-[#0F766E] flex-shrink-0" />
                  <span className="text-[13px] text-[#0F4C4C] truncate">{s.shortName ?? s.name}</span>
                </div>
                <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#5F6E6D]">
                  {s.capabilities.length} stages
                </span>
              </li>
            ))}
          </ul>
        </AdminCard>

        <AdminCard
          eyebrow="Pricing controls"
          title="Commercial structure"
          description="Recurring vs. project vs. hybrid. Each service line can have multiple SKUs — sized to seat count, devices, or fixed-scope."
        >
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'MRR / recurring', value: 5 },
              { label: 'Fixed-price', value: 2 },
              { label: 'T&M', value: 2 },
              { label: 'Hybrid', value: 1 },
            ].map((row) => (
              <div
                key={row.label}
                className="bg-[#F4F8F7] border border-[#D5E0DE] rounded-[3px] px-4 py-3"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D]">
                  {row.label}
                </p>
                <p
                  className="mt-1 font-serif text-[22px] text-[#0F4C4C] leading-none tracking-[-0.015em]"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {String(row.value).padStart(2, '0')}
                </p>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>
    </div>
  )
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] font-medium ${className}`}
    >
      {children}
    </th>
  )
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>
}
