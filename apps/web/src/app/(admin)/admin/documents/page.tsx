import type { Metadata } from 'next'
import { FileText, Plus, ScrollText, Shield, FileSignature, Calendar } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { getDocuments, formatRelative } from '@/server/admin-data'
import type { CrmDocument } from '@gitsols/types'

export const metadata: Metadata = { title: 'Documents · Admin' }

const TEMPLATES = [
  { id: 'tpl-sow', name: 'Statement of Work', kind: 'Contract', updated: '12d ago', uses: 47, icon: ScrollText },
  { id: 'tpl-msa', name: 'Master Service Agreement', kind: 'Contract', updated: '32d ago', uses: 31, icon: Shield },
  { id: 'tpl-proposal', name: 'Proposal · Managed IT', kind: 'Sales', updated: '6d ago', uses: 58, icon: FileSignature },
  { id: 'tpl-proposal-bespoke', name: 'Proposal · Bespoke build', kind: 'Sales', updated: '4d ago', uses: 19, icon: FileSignature },
  { id: 'tpl-qbr', name: 'Quarterly Business Review', kind: 'Recurring', updated: '14d ago', uses: 92, icon: Calendar },
  { id: 'tpl-monthly', name: 'Monthly client report', kind: 'Recurring', updated: '2d ago', uses: 412, icon: FileText },
]

// Tone + label keyed on the live CrmDocument.kind union. Record<string,string>
// + fallback so an unexpected/new kind never throws or renders blank.
const KIND_TONE: Record<string, string> = {
  sow: 'bg-[#0F4C4C] text-white border-[#0F766E]',
  msa: 'bg-[#0F4C4C] text-white border-[#0F766E]',
  proposal: 'bg-[#ECFEFE] text-[#0F4C4C] border-[#CFFAFA]',
  report: 'bg-[#FAEFD4] text-[#7A5A1F] border-[#E8D4A0]',
  policy: 'bg-[#F4F8F7] text-[#5F6E6D] border-[#D5E0DE]',
  invoice: 'bg-[#FBE6E1] text-[#B53A2B] border-[#F5C9C0]',
  other: 'bg-[#F4F8F7] text-[#5F6E6D] border-[#D5E0DE]',
}

const KIND_LABEL: Record<string, string> = {
  sow: 'SoW',
  msa: 'MSA',
  proposal: 'Proposal',
  report: 'Report',
  policy: 'Policy',
  invoice: 'Invoice',
  other: 'Other',
}

function formatBytes(bytes?: number) {
  if (bytes === undefined || bytes <= 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(0)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

export default async function AdminDocumentsPage() {
  const documents = await getDocuments()

  return (
    <div className="max-w-[1400px] space-y-6">
      <AdminPageHeader
        eyebrow="Library · Documents"
        title="Documents"
        description="Templates and signed/sent client documents. Variables pull from CRM (account.name, engagement.total_value). E-signature via DocuSeal."
        breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Library' }, { label: 'Documents' }]}
        stats={[
          { label: 'Templates', value: TEMPLATES.length },
          { label: 'Documents', value: documents.length },
          { label: 'SoW / MSA', value: documents.filter((d) => d.kind === 'sow' || d.kind === 'msa').length, hint: 'contracts' },
          { label: 'Invoices', value: documents.filter((d) => d.kind === 'invoice').length, hint: 'billing' },
        ]}
        primaryAction={{ label: 'New template', href: '/admin/documents', icon: Plus }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AdminCard eyebrow="Library" title="Templates">
          <div className="space-y-2">
            {TEMPLATES.map((t) => {
              const Icon = t.icon
              return (
                <div
                  key={t.id}
                  className="flex items-center gap-4 px-4 py-3 rounded-[3px] border border-[#D5E0DE] bg-[#F4F8F7]/60 hover:bg-white transition-colors"
                >
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-[3px] bg-white border border-[#D5E0DE] flex-shrink-0">
                    <Icon className="w-4 h-4 text-[#0F4C4C]" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-[14.5px] text-[#0F4C4C] tracking-[-0.005em]" style={{ fontFamily: 'var(--font-serif)' }}>
                      {t.name}
                    </p>
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#5F6E6D] mt-0.5">
                      {t.kind} · {t.uses} uses · updated {t.updated}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </AdminCard>

        <AdminCard eyebrow="Recent" title="Documents sent / signed" flush>
          {documents.length === 0 ? (
            <div className="px-6 py-10 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-[#5F6E6D]">
              No documents yet
            </div>
          ) : (
            <ul>
              {documents.map((d: CrmDocument, i, arr) => (
                <li
                  key={d.id}
                  className={`px-6 py-4 ${i < arr.length - 1 ? 'border-b border-[#E5EDEB]' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#0F766E]">
                      {d.id} · {KIND_LABEL[d.kind] ?? d.kind}
                    </p>
                    <span className={`inline-flex items-center font-mono text-[10px] uppercase tracking-[0.16em] px-2 py-1 rounded-[3px] border ${KIND_TONE[d.kind] ?? 'bg-[#F4F8F7] text-[#5F6E6D] border-[#D5E0DE]'}`}>
                      {KIND_LABEL[d.kind] ?? d.kind}
                    </span>
                  </div>
                  <p className="font-serif text-[15px] text-[#0F4C4C] tracking-[-0.005em]" style={{ fontFamily: 'var(--font-serif)' }}>
                    {d.name}
                  </p>
                  <p className="font-mono text-[10.5px] text-[#5F6E6D] mt-0.5">
                    {d.accountName ?? '—'} · {formatRelative(d.createdAt)}
                    {d.uploadedBy ? ` · ${d.uploadedBy}` : ''} · {formatBytes(d.sizeBytes)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>
    </div>
  )
}
