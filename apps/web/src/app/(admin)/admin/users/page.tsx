import type { Metadata } from 'next'
import { Plus } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { getUsers, formatRelative } from '@/server/admin-data'
import type { AdminUser } from '@gitsols/types'

export const metadata: Metadata = { title: 'Team & roles · Admin' }

// Static RBAC reference — permission descriptions per role. Member counts are
// computed live from the fetched users below. `slug` matches the live Role union.
const ROLE_REFERENCE: { slug: string; name: string; perms: string }[] = [
  { slug: 'owner', name: 'Owner', perms: 'Everything' },
  { slug: 'admin', name: 'Admin', perms: 'All except billing' },
  { slug: 'sales', name: 'Sales', perms: 'CRM read/write · pipeline · accounts' },
  { slug: 'pm', name: 'PM', perms: 'Engagements · milestones · tickets' },
  { slug: 'tech', name: 'Tech', perms: 'Assigned tickets · milestones' },
  { slug: 'readonly', name: 'Read-only', perms: 'Read all · no writes' },
  { slug: 'client_primary', name: 'Client primary', perms: 'Portal admin · approves milestones' },
  { slug: 'client_user', name: 'Client user', perms: 'Files tickets · sees own data' },
]

// Display labels + tones keyed on the live Role union. Record<string,string>
// + fallback so a future/unknown role never throws or renders blank.
const ROLE_LABEL: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  sales: 'Sales',
  pm: 'PM',
  tech: 'Tech',
  readonly: 'Read-only',
  client_primary: 'Client primary',
  client_user: 'Client user',
}

const ROLE_TONE: Record<string, string> = {
  owner: 'bg-[#0F4C4C] text-white border-[#0F766E]',
  admin: 'bg-[#CFFAFA] text-[#0F4C4C] border-[#0F766E]',
  sales: 'bg-[#ECFEFE] text-[#0F4C4C] border-[#CFFAFA]',
  pm: 'bg-[#FAEFD4] text-[#7A5A1F] border-[#E8D4A0]',
  tech: 'bg-[#F4F8F7] text-[#0F4C4C] border-[#D5E0DE]',
  readonly: 'bg-[#F4F8F7] text-[#5F6E6D] border-[#D5E0DE]',
  client_primary: 'bg-[#ECFEFE] text-[#0F4C4C] border-[#CFFAFA]',
  client_user: 'bg-[#F4F8F7] text-[#5F6E6D] border-[#D5E0DE]',
}

export default async function AdminUsersPage() {
  const users = await getUsers()
  const roles = ROLE_REFERENCE.map((r) => ({
    ...r,
    count: users.filter((u) => u.role === r.slug).length,
  }))

  return (
    <div className="max-w-[1400px] space-y-6">
      <AdminPageHeader
        eyebrow="Configuration · Identity"
        title="Team & roles"
        description="Internal staff with admin access. RBAC enforced everywhere — Owner, Admin, Sales, PM, Engineer, Read-only. MFA required for any role that touches PHI-adjacent records."
        breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Configuration' }, { label: 'Team & roles' }]}
        stats={[
          { label: 'Members', value: users.length },
          { label: 'Internal', value: users.filter((u) => !u.role.startsWith('client_')).length, hint: 'staff' },
          { label: 'Client users', value: users.filter((u) => u.role.startsWith('client_')).length, hint: 'portal' },
          { label: 'Roles', value: roles.length },
        ]}
        primaryAction={{ label: 'New user', href: '/admin/users/new', icon: Plus }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <AdminCard eyebrow="Members" title="Active team" className="lg:col-span-2" flush>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-[#F4F8F7] border-b border-[#D5E0DE]">
                <tr className="text-left">
                  <Th>Member</Th>
                  <Th>Role</Th>
                  <Th>Account</Th>
                  <Th>Joined</Th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-[#5F6E6D]">
                      No members yet
                    </td>
                  </tr>
                )}
                {users.map((u: AdminUser) => (
                  <tr key={u.id} className="border-b border-[#E5EDEB] hover:bg-[#F4F8F7]/60 transition-colors">
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-start gap-3">
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-[3px] bg-[#F4F8F7] border border-[#D5E0DE] font-serif text-[13px] text-[#0F4C4C] flex-shrink-0" style={{ fontFamily: 'var(--font-serif)' }}>
                          {u.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                        </span>
                        <div>
                          <p className="font-serif text-[15px] text-[#0F4C4C] tracking-[-0.005em]" style={{ fontFamily: 'var(--font-serif)' }}>
                            {u.name}
                          </p>
                          <p className="font-mono text-[10.5px] text-[#5F6E6D] mt-0.5">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className={`inline-flex items-center font-mono text-[10.5px] uppercase tracking-[0.14em] px-2 py-1 rounded-[3px] border ${ROLE_TONE[u.role] ?? 'bg-[#F4F8F7] text-[#0F4C4C] border-[#D5E0DE]'}`}>
                        {ROLE_LABEL[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top font-mono text-[11.5px] text-[#5F6E6D]">
                      {u.accountName ?? '—'}
                    </td>
                    <td className="px-4 py-3 align-top font-mono text-[11px] text-[#5F6E6D]">{formatRelative(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>

        <AdminCard eyebrow="RBAC" title="Roles">
          <ul className="space-y-2">
            {roles.map((r) => (
              <li
                key={r.slug}
                className="flex items-start justify-between gap-3 p-3 rounded-[3px] border border-[#D5E0DE] bg-[#F4F8F7]/60"
              >
                <div className="min-w-0">
                  <p className="font-serif text-[15px] text-[#0F4C4C] tracking-[-0.005em]" style={{ fontFamily: 'var(--font-serif)' }}>
                    {r.name}
                  </p>
                  <p className="text-[12px] text-[#5F6E6D] mt-0.5 leading-snug">{r.perms}</p>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#0F766E] mt-1">
                  {r.count} {r.count === 1 ? 'member' : 'members'}
                </span>
              </li>
            ))}
          </ul>
        </AdminCard>
      </div>
    </div>
  )
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] font-medium ${className}`}>{children}</th>
}
