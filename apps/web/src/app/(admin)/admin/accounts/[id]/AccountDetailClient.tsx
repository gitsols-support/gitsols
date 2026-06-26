'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Building2,
  Briefcase,
  Ticket as TicketIcon,
  FileText,
  CreditCard,
  Users as UsersIcon,
  Plus,
  Save,
  Loader2,
  ArrowUpRight,
  Mail,
  Phone,
  Star,
  Archive,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { useToast } from '@/components/admin/Toast'
import { formatCurrency, formatRelative } from '@/server/admin-stubs'
import { updateAccount } from '@/server/admin-actions'
import type {
  CrmAccount,
  AccountTier,
  AccountStatus,
  AccountHealth,
  Industry,
  Contact,
  Engagement,
  Ticket,
} from '@gitsols/types'

type Tab = 'overview' | 'contacts' | 'engagements' | 'tickets' | 'billing' | 'documents'

interface ContactRow {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  primary: boolean
}

interface Invoice {
  id: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
}

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: Building2 },
  { id: 'contacts', label: 'Contacts', icon: UsersIcon },
  { id: 'engagements', label: 'Engagements', icon: Briefcase },
  { id: 'tickets', label: 'Tickets', icon: TicketIcon },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'documents', label: 'Documents', icon: FileText },
]

const TIERS: AccountTier[] = ['enterprise', 'mid-market', 'smb']
const STATUSES: AccountStatus[] = ['active', 'onboarding', 'at-risk', 'churned']
const HEALTHS: AccountHealth[] = ['excellent', 'good', 'watch', 'critical']

export default function AccountDetailClient({
  initial,
  contacts: contactsProp,
  engagements,
  tickets,
}: {
  initial: CrmAccount
  contacts: Contact[]
  engagements: Engagement[]
  tickets: Ticket[]
}) {
  const router = useRouter()
  const { push } = useToast()

  const [account, setAccount] = useState<CrmAccount>(initial)
  const [tab, setTab] = useState<Tab>('overview')
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirm, setConfirm] = useState<'archive' | 'mark-churned' | null>(null)

  // Contacts state — seeded from the live account contacts.
  const [contacts, setContacts] = useState<ContactRow[]>(() =>
    contactsProp.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      role: c.title ?? 'Contact',
      primary: c.isPrimary,
    })),
  )
  const [addingContact, setAddingContact] = useState(false)
  const [contactDraft, setContactDraft] = useState<Omit<ContactRow, 'id' | 'primary'>>({
    name: '',
    email: '',
    phone: '',
    role: '',
  })

  // Invoices preview — derived from the account MRR until a billing API ships.
  const [invoices] = useState<Invoice[]>(() => [
    { id: 'INV-2026-0412', date: '2026-05-01', amount: account.mrr, status: 'paid' },
    { id: 'INV-2026-0381', date: '2026-04-01', amount: account.mrr, status: 'paid' },
    { id: 'INV-2026-0350', date: '2026-03-01', amount: account.mrr, status: 'paid' },
    { id: 'INV-2026-0319', date: '2026-02-01', amount: Math.max(0, account.mrr - 2000), status: 'paid' },
  ])

  function update<K extends keyof CrmAccount>(key: K, value: CrmAccount[K]) {
    setAccount((a) => ({ ...a, [key]: value }))
    setDirty(true)
  }

  async function save() {
    setSaving(true)
    const res = await updateAccount(account.id, {
      name: account.name,
      tier: account.tier,
      status: account.status,
      health: account.health,
      mrr: account.mrr,
      seats: account.seats,
      primaryContact: account.primaryContact,
      primaryEmail: account.primaryEmail,
      industry: account.industry,
      since: account.since,
      nextRenewal: account.nextRenewal,
      servicesUsed: account.servicesUsed,
    })
    setSaving(false)
    if (res.ok) {
      setAccount(res.data)
      setDirty(false)
      push('success', 'Saved', `${res.data.name} updated.`)
    } else {
      push('error', 'Save failed', res.error)
    }
  }

  function addContact() {
    if (!contactDraft.name.trim() || !contactDraft.email.trim()) {
      push('error', 'Missing fields', 'Name and email are required.')
      return
    }
    setContacts((cs) => [
      ...cs,
      {
        id: `c-${Date.now()}`,
        name: contactDraft.name,
        email: contactDraft.email,
        phone: contactDraft.phone,
        role: contactDraft.role || 'Contact',
        primary: false,
      },
    ])
    setContactDraft({ name: '', email: '', phone: '', role: '' })
    setAddingContact(false)
    push('success', 'Contact added', contactDraft.name)
  }

  function removeContact(id: string) {
    const c = contacts.find((x) => x.id === id)
    if (!c) return
    if (c.primary) {
      push('error', "Can't remove primary", 'Promote another contact first.')
      return
    }
    setContacts((cs) => cs.filter((x) => x.id !== id))
    push('info', 'Contact removed', c.name)
  }

  async function makePrimary(id: string) {
    const next = contacts.find((c) => c.id === id)
    if (!next) return
    setContacts((cs) => cs.map((c) => ({ ...c, primary: c.id === id })))
    setAccount((a) => ({ ...a, primaryContact: next.name, primaryEmail: next.email }))
    const res = await updateAccount(account.id, {
      primaryContact: next.name,
      primaryEmail: next.email,
    })
    if (res.ok) {
      setAccount(res.data)
      push('success', 'Primary updated', `${next.name} is now the primary contact.`)
    } else {
      push('error', 'Update failed', res.error)
    }
  }

  const accountEngagements = engagements
  const accountTickets = tickets

  return (
    <div className="max-w-[1400px] space-y-6">
      <AdminPageHeader
        eyebrow={`Account · ${account.id}`}
        title={account.name}
        description={`${(account.industry ?? '—').replace('-', ' ')} · ${account.tier} · since ${account.since ? new Date(account.since).getFullYear() : '—'}`}
        badge={
          account.status === 'at-risk'
            ? { label: 'At risk', tone: 'warn' }
            : account.status === 'churned'
              ? { label: 'Churned', tone: 'muted' }
              : { label: account.status, tone: 'live' }
        }
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Accounts', href: '/admin/accounts' },
          { label: account.name },
        ]}
        stats={[
          { label: 'MRR', value: formatCurrency(account.mrr, { compact: true }) },
          { label: 'Seats', value: account.seats },
          { label: 'Engagements', value: accountEngagements.length },
          { label: 'Open tickets', value: accountTickets.filter((t) => t.status !== 'resolved').length },
        ]}
      />

      {/* Sticky toolbar */}
      <div className="sticky top-0 z-20 -mx-6 -mt-1 px-6 py-3 bg-[#F4F8F7]/95 backdrop-blur border-b border-[#D5E0DE]">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span
            className={`inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] ${dirty ? 'text-[#7A5A1F]' : 'text-[#0F766E]'}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${dirty ? 'bg-[#C5933A]' : 'bg-[#0F766E]'}`}
            />
            {dirty ? 'Unsaved changes' : 'All changes saved'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setConfirm('mark-churned')}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#B53A2B] border border-[#F5C9C0] bg-[#FBE6E1]/30 hover:bg-[#FBE6E1] px-3 py-2 rounded-[3px] transition-colors"
            >
              <Archive className="w-3.5 h-3.5" />
              Mark churned
            </button>
            <button
              type="button"
              onClick={save}
              disabled={!dirty || saving}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white bg-[#0F4C4C] hover:bg-[#082F2F] px-4 py-2 rounded-[3px] transition-colors border border-[#082F2F] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-[#D5E0DE] rounded-[4px] overflow-hidden">
        <div className="border-b border-[#D5E0DE] flex flex-wrap">
          {TABS.map((t) => {
            const Icon = t.icon
            const active = tab === t.id
            const count =
              t.id === 'engagements' ? accountEngagements.length
              : t.id === 'tickets' ? accountTickets.length
              : t.id === 'contacts' ? contacts.length
              : t.id === 'billing' ? invoices.length
              : null
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`relative inline-flex items-center gap-2 px-5 py-3 text-[12.5px] font-semibold transition-colors ${
                  active
                    ? 'text-[#0F4C4C] bg-[#F4F8F7]'
                    : 'text-[#5F6E6D] hover:text-[#0F4C4C] hover:bg-[#F4F8F7]/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
                {count !== null && (
                  <span className="font-mono text-[10px] text-[#5F6E6D]">({count})</span>
                )}
                {active && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0F766E]" />}
              </button>
            )
          })}
        </div>

        <div className="p-6">
          {tab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F766E]">Firm details</h3>
                <Field label="Account name" value={account.name} onChange={(v) => update('name', v)} />
                <SelectField
                  label="Tier"
                  value={account.tier}
                  onChange={(v) => update('tier', v as AccountTier)}
                  options={TIERS.map((t) => ({ value: t, label: t }))}
                />
                <SelectField
                  label="Industry"
                  value={account.industry ?? ''}
                  onChange={(v) => update('industry', v as Industry)}
                  options={[
                    { value: 'healthcare', label: 'Healthcare' },
                    { value: 'financial-services', label: 'Financial services' },
                    { value: 'professional-services', label: 'Professional services' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
                <SelectField
                  label="Status"
                  value={account.status}
                  onChange={(v) => update('status', v as AccountStatus)}
                  options={STATUSES.map((s) => ({ value: s, label: s }))}
                />
                <SelectField
                  label="Health"
                  value={account.health}
                  onChange={(v) => update('health', v as AccountHealth)}
                  options={HEALTHS.map((h) => ({ value: h, label: h }))}
                />
              </div>
              <div className="space-y-4">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F766E]">Commercial</h3>
                <NumberField
                  label="MRR ($)"
                  value={account.mrr}
                  onChange={(v) => update('mrr', v)}
                />
                <NumberField
                  label="Seats"
                  value={account.seats}
                  onChange={(v) => update('seats', v)}
                />
                <Field
                  label="Next renewal"
                  value={account.nextRenewal ?? ''}
                  onChange={(v) => update('nextRenewal', v)}
                  hint="YYYY-MM-DD"
                />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5">
                    Services subscribed
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {account.servicesUsed.length === 0 && (
                      <span className="font-mono text-[10.5px] text-[#5F6E6D]/70">No services on file</span>
                    )}
                    {account.servicesUsed.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center font-mono text-[10.5px] uppercase tracking-[0.12em] text-[#0F4C4C] bg-[#ECFEFE] border border-[#CFFAFA] px-2 py-1 rounded-[3px]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'contacts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[13px] text-[#5F6E6D]">
                  Manage who at the client can access the portal and receive comms.
                </p>
                <button
                  type="button"
                  onClick={() => setAddingContact((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0F4C4C] border border-[#D5E0DE] bg-white hover:border-[#0F4C4C]/40 px-3 py-1.5 rounded-[3px] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add contact
                </button>
              </div>

              {addingContact && (
                <div className="bg-[#F4F8F7] border border-[#D5E0DE] rounded-[3px] p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field
                      label="Name"
                      value={contactDraft.name}
                      onChange={(v) => setContactDraft({ ...contactDraft, name: v })}
                    />
                    <Field
                      label="Email"
                      value={contactDraft.email}
                      onChange={(v) => setContactDraft({ ...contactDraft, email: v })}
                    />
                    <Field
                      label="Phone"
                      value={contactDraft.phone ?? ''}
                      onChange={(v) => setContactDraft({ ...contactDraft, phone: v })}
                    />
                    <Field
                      label="Role"
                      value={contactDraft.role}
                      onChange={(v) => setContactDraft({ ...contactDraft, role: v })}
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAddingContact(false)
                        setContactDraft({ name: '', email: '', phone: '', role: '' })
                      }}
                      className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#5F6E6D] hover:text-[#0F4C4C]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={addContact}
                      className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white bg-[#0F4C4C] hover:bg-[#082F2F] px-3 py-1.5 rounded-[3px] border border-[#082F2F]"
                    >
                      Save contact
                    </button>
                  </div>
                </div>
              )}

              {contacts.length === 0 ? (
                <EmptyState
                  icon={UsersIcon}
                  title="No contacts yet"
                  body="Add a contact to manage portal access and client communications."
                />
              ) : (
                <ul className="divide-y divide-[#E5EDEB] border border-[#D5E0DE] rounded-[3px]">
                  {contacts.map((c) => (
                    <li key={c.id} className="flex items-start gap-4 px-4 py-3">
                      <span
                        className="inline-flex items-center justify-center w-9 h-9 rounded-[3px] bg-[#F4F8F7] border border-[#D5E0DE] font-serif text-[13px] text-[#0F4C4C]"
                        style={{ fontFamily: 'var(--font-serif)' }}
                      >
                        {c.name
                          .split(' ')
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className="font-serif text-[15px] text-[#0F4C4C] tracking-[-0.005em]"
                            style={{ fontFamily: 'var(--font-serif)' }}
                          >
                            {c.name}
                          </p>
                          {c.primary && (
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#0F4C4C] bg-[#CFFAFA] border border-[#0F766E] px-1.5 py-0.5 rounded-[3px]">
                              <Star className="w-2.5 h-2.5 fill-[#0F4C4C]" />
                              Primary
                            </span>
                          )}
                          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#5F6E6D]">
                            {c.role}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 font-mono text-[11px] text-[#5F6E6D]">
                          <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1 hover:text-[#0F4C4C]">
                            <Mail className="w-3 h-3" /> {c.email}
                          </a>
                          {c.phone && (
                            <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1 hover:text-[#0F4C4C]">
                              <Phone className="w-3 h-3" /> {c.phone}
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!c.primary && (
                          <button
                            type="button"
                            onClick={() => makePrimary(c.id)}
                            className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#0F4C4C] hover:text-[#082F2F]"
                          >
                            Make primary
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeContact(c.id)}
                          className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#5F6E6D] hover:text-[#B53A2B]"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === 'engagements' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[13px] text-[#5F6E6D]">
                  Every project and managed retainer on this account.
                </p>
                <Link
                  href="/admin/engagements"
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0F4C4C] border border-[#D5E0DE] bg-white hover:border-[#0F4C4C]/40 px-3 py-1.5 rounded-[3px] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New engagement
                </Link>
              </div>
              {accountEngagements.length === 0 ? (
                <EmptyState
                  icon={Briefcase}
                  title="No engagements yet"
                  body="Start a new engagement to begin the 9-stage delivery lifecycle."
                />
              ) : (
                <ul className="divide-y divide-[#E5EDEB] border border-[#D5E0DE] rounded-[3px]">
                  {accountEngagements.map((e) => (
                    <li key={e.id} className="flex items-start gap-4 px-4 py-3 hover:bg-[#F4F8F7]/60 transition-colors">
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-[3px] bg-[#0F4C4C] text-white">
                        <Briefcase className="w-3.5 h-3.5" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-serif text-[15px] text-[#0F4C4C]"
                          style={{ fontFamily: 'var(--font-serif)' }}
                        >
                          {e.name}
                        </p>
                        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#5F6E6D] mt-0.5">
                          {e.id} · {e.stage} · next: {e.nextMilestone ?? '—'}
                        </p>
                      </div>
                      <Link
                        href={`/admin/engagements/${e.id}` as never}
                        className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[#0F4C4C] hover:text-[#082F2F]"
                      >
                        Open
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === 'tickets' && (
            <div className="space-y-3">
              {accountTickets.length === 0 ? (
                <EmptyState
                  icon={TicketIcon}
                  title="No tickets"
                  body="Open tickets across all client users will appear here."
                />
              ) : (
                <ul className="divide-y divide-[#E5EDEB] border border-[#D5E0DE] rounded-[3px]">
                  {accountTickets.map((t) => (
                    <li key={t.id} className="flex items-start gap-4 px-4 py-3 hover:bg-[#F4F8F7]/60 transition-colors">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-[3px] flex-shrink-0 ${
                          t.priority === 'p1'
                            ? 'bg-[#FBE6E1] text-[#B53A2B]'
                            : 'bg-[#FAEFD4] text-[#7A5A1F]'
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-[#0F4C4C]">{t.subject}</p>
                        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#5F6E6D] mt-0.5">
                          {t.id} · {t.priority.toUpperCase()} · {t.status} · {formatRelative(t.openedAt)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === 'billing' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-[#D5E0DE] border border-[#D5E0DE] rounded-[3px] overflow-hidden">
                <Stat label="MRR" value={formatCurrency(account.mrr, { compact: true })} />
                <Stat label="ARR" value={formatCurrency(account.mrr * 12, { compact: true })} />
                <Stat label="LTV (est)" value={formatCurrency(account.mrr * 38, { compact: true })} />
                <Stat
                  label="Next renewal"
                  value={
                    account.nextRenewal
                      ? new Date(account.nextRenewal).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                      : '—'
                  }
                />
              </div>
              <ul className="divide-y divide-[#E5EDEB] border border-[#D5E0DE] rounded-[3px]">
                {invoices.map((inv) => (
                  <li key={inv.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="font-mono text-[12px] text-[#0F4C4C]">{inv.id}</p>
                      <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#5F6E6D] mt-0.5">
                        {new Date(inv.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className="font-serif text-[18px] text-[#0F4C4C] tracking-[-0.005em]"
                        style={{ fontFamily: 'var(--font-serif)' }}
                      >
                        {formatCurrency(inv.amount, { compact: true })}
                      </p>
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#0F766E]">
                        {inv.status}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === 'documents' && (
            <EmptyState
              icon={FileText}
              title="Documents"
              body="SoWs, MSAs, monthly reports, and signed deliverables linked to this account will appear here."
            />
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirm === 'mark-churned'}
        title={`Mark ${account.name} as churned?`}
        body="This stops billing on next cycle, freezes engagements, and triggers the off-boarding workflow."
        confirmLabel="Mark churned"
        destructive
        onConfirm={async () => {
          setConfirm(null)
          setAccount((a) => ({ ...a, status: 'churned' }))
          const res = await updateAccount(account.id, { status: 'churned' })
          if (res.ok) {
            setAccount(res.data)
            push('info', 'Marked churned', `${res.data.name} entered off-boarding.`)
            router.push('/admin/accounts')
          } else {
            push('error', 'Update failed', res.error)
          }
        }}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  hint?: string
}) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5 block">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      />
      {hint && <p className="mt-1 font-mono text-[10.5px] text-[#5F6E6D]">{hint}</p>}
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5 block">
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="input"
      />
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5 block">
        {label}
      </label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="input">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#5F6E6D]">{label}</p>
      <p
        className="mt-1.5 font-serif text-[22px] text-[#0F4C4C] leading-none tracking-[-0.015em]"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        {value}
      </p>
    </div>
  )
}

function EmptyState({ icon: Icon, title, body }: { icon: React.ElementType; title: string; body: string }) {
  return (
    <div className="text-center py-10 border border-dashed border-[#D5E0DE] rounded-[3px] bg-[#F4F8F7]/40">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-[3px] bg-white border border-[#D5E0DE] mb-3">
        <Icon className="w-5 h-5 text-[#5F6E6D]" />
      </div>
      <p
        className="font-serif text-[18px] text-[#0F4C4C] tracking-[-0.005em]"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        {title}
      </p>
      <p className="text-[12.5px] text-[#5F6E6D] mt-1 max-w-sm mx-auto leading-snug">{body}</p>
    </div>
  )
}

// Mark CheckCircle2 as used for linting (kept for future tab use)
void CheckCircle2
