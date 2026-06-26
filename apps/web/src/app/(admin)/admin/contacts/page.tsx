import type { Metadata } from 'next'
import { Plus, Mail, Phone, Building2 } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { getContacts } from '@/server/admin-data'
import type { Contact } from '@gitsols/types'

export const metadata: Metadata = { title: 'Contacts · Admin' }

export default async function AdminContactsPage() {
  const contacts = await getContacts()
  const primaryCount = contacts.filter((c) => c.isPrimary).length

  return (
    <div className="max-w-[1400px] space-y-6">
      <AdminPageHeader
        eyebrow="CRM · People"
        title="Contacts"
        description="The people behind every account. Roles, primary contacts, escalation paths."
        breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'CRM' }, { label: 'Contacts' }]}
        stats={[
          { label: 'Contacts', value: contacts.length },
          { label: 'Primary contacts', value: primaryCount },
          { label: 'Escalation paths', value: 6 },
          { label: 'Portal users', value: 41, hint: 'invited' },
        ]}
        primaryAction={{ label: 'Add contact', href: '/admin/contacts', icon: Plus }}
      />

      <AdminCard eyebrow="Roster" title={`${contacts.length} contacts`} flush>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-[#F4F8F7] border-b border-[#D5E0DE]">
              <tr className="text-left">
                <Th>Contact</Th>
                <Th>Role</Th>
                <Th>Account</Th>
                <Th>Industry</Th>
                <Th>Channels</Th>
                <Th>Since</Th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c: Contact) => (
                <tr key={c.id} className="border-b border-[#E5EDEB] hover:bg-[#F4F8F7]/60 transition-colors">
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-[3px] bg-[#F4F8F7] border border-[#D5E0DE] font-serif text-[13px] text-[#0F4C4C] flex-shrink-0" style={{ fontFamily: 'var(--font-serif)' }}>
                        {c.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="font-serif text-[15px] text-[#0F4C4C] tracking-[-0.005em]" style={{ fontFamily: 'var(--font-serif)' }}>
                          {c.name}
                        </p>
                        <p className="font-mono text-[10.5px] text-[#5F6E6D] mt-0.5 truncate">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#0F4C4C] bg-[#ECFEFE] border border-[#CFFAFA] px-2 py-1 rounded-[3px]">
                      {c.isPrimary ? 'Primary contact' : c.title ?? 'Contact'}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className="inline-flex items-center gap-2 text-[12.5px] text-[#0F4C4C]">
                      <Building2 className="w-3.5 h-3.5 text-[#0F766E]" />
                      {c.accountName ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top font-mono text-[11.5px] uppercase tracking-[0.12em] text-[#5F6E6D]">
                    —
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center gap-3 font-mono text-[11px] text-[#5F6E6D]">
                      <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3" /> email</span>
                      <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" /> phone</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top font-mono text-[11px] text-[#5F6E6D]">
                    {new Date(c.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  )
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] font-medium ${className}`}>{children}</th>
}
