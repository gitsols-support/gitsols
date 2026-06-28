'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, Loader2, UserPlus } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { useToast } from '@/components/admin/Toast'
import { createUser } from '@/server/admin-actions'
import type { Role, CreateUserRequest } from '@gitsols/types'

const INTERNAL: { value: Role; label: string }[] = [
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'sales', label: 'Sales' },
  { value: 'pm', label: 'Project manager' },
  { value: 'tech', label: 'Technician' },
  { value: 'readonly', label: 'Read-only' },
]
const CLIENT: { value: Role; label: string }[] = [
  { value: 'client_primary', label: 'Client — primary (admin)' },
  { value: 'client_user', label: 'Client — user' },
]

export default function UserFormClient({ accounts }: { accounts: { id: string; name: string }[] }) {
  const router = useRouter()
  const { push } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('client_primary')
  const [accountId, setAccountId] = useState('')
  const [initialPassword, setInitialPassword] = useState('')
  const [saving, setSaving] = useState(false)

  const isClient = role === 'client_primary' || role === 'client_user'

  function genPassword() {
    const s = 'Gs' + Math.random().toString(36).slice(2, 10) + Math.floor(Math.random() * 90 + 10)
    setInitialPassword(s)
  }

  const valid = useMemo(() => {
    if (!name.trim() || !email.trim()) return false
    if (isClient && !accountId) return false
    if (isClient && initialPassword && (initialPassword.length < 10 || !/[A-Za-z]/.test(initialPassword) || !/[0-9]/.test(initialPassword))) return false
    return true
  }, [name, email, isClient, accountId, initialPassword])

  async function submit() {
    if (!valid) {
      push('error', 'Check the form', isClient ? 'Client users need an account, and a valid password (10+ chars, letter + number).' : 'Name and email are required.')
      return
    }
    setSaving(true)
    const body: CreateUserRequest = {
      name: name.trim(),
      email: email.trim(),
      role,
      ...(accountId ? { accountId } : {}),
      ...(isClient && initialPassword ? { initialPassword } : {}),
    }
    const res = await createUser(body)
    setSaving(false)
    if (!res.ok) {
      push('error', 'Could not create user', res.error)
      return
    }
    push('success', 'User created', isClient && initialPassword ? `Share the initial password with ${email}` : email)
    router.push('/admin/users')
  }

  return (
    <div className="max-w-[820px] space-y-6">
      <AdminPageHeader
        eyebrow="Configuration · New user"
        title="Create user"
        description="Add an internal staff member or provision a client portal user (tied to an account, with an initial password)."
        breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Team & roles', href: '/admin/users' }, { label: 'New' }]}
      />
      <AdminCard eyebrow="Identity" title="Who is this?">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Full name" value={name} onChange={setName} />
          <Field label="Email" value={email} onChange={setEmail} />
          <div>
            <Label>Role</Label>
            <select className="input" value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <optgroup label="Internal staff">{INTERNAL.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</optgroup>
              <optgroup label="Client portal">{CLIENT.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</optgroup>
            </select>
          </div>
          <div>
            <Label>Account {isClient && <span className="text-[#B53A2B]">*</span>}</Label>
            <select className="input" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              <option value="">{isClient ? '— Select the client account —' : '— None (internal) —'}</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
        </div>
      </AdminCard>

      {isClient && (
        <AdminCard eyebrow="Access" title="Initial password">
          <div className="flex items-end gap-3 flex-wrap">
            <div className="flex-1 min-w-[240px]">
              <Label>Initial password (forces reset on first login)</Label>
              <input className="input" value={initialPassword} onChange={(e) => setInitialPassword(e.target.value)} placeholder="10+ chars, a letter and a number" />
            </div>
            <button type="button" onClick={genPassword} className="text-[12px] font-mono uppercase tracking-[0.12em] text-[#0F766E] hover:text-[#0F4C4C] border border-[#D5E0DE] rounded-[3px] px-3 py-2.5">Generate</button>
          </div>
          <p className="mt-2 text-[11.5px] text-[#5F6E6D]">Share this with the client securely. They&apos;ll be required to set their own password on first sign-in at <span className="font-mono">/portal</span>.</p>
        </AdminCard>
      )}

      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={() => router.push('/admin/users')} className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#5F6E6D] hover:text-[#0F4C4C] px-3 py-2">Cancel</button>
        <button type="button" onClick={submit} disabled={saving} className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white bg-[#0F766E] hover:bg-[#0F4C4C] px-4 py-2.5 rounded-[3px] border border-[#0F4C4C] disabled:opacity-60">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />} Create user <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5 block">{children}</label>
}
function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (<div><Label>{label}</Label><input className="input" value={value} onChange={(e) => onChange(e.target.value)} /></div>)
}
