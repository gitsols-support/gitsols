'use client'

import { useState } from 'react'
import { Loader2, KeyRound, Check } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { useToast } from '@/components/admin/Toast'
import { changeMyPassword } from '@/server/admin-actions'

export default function AccountSecurityClient() {
  const { push } = useToast()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  async function submit() {
    if (!current) return push('error', 'Current password required', 'Enter your current password.')
    if (next.length < 10 || !/[A-Za-z]/.test(next) || !/[0-9]/.test(next)) {
      return push('error', 'Weak password', 'At least 10 characters, with a letter and a number.')
    }
    if (next !== confirm) return push('error', 'Mismatch', 'New passwords do not match.')

    setSaving(true)
    const res = await changeMyPassword(next, current)
    setSaving(false)
    if (!res.ok) {
      push('error', 'Could not update password', /401|incorrect/i.test(res.error) ? 'Current password is incorrect.' : res.error)
      return
    }
    push('success', 'Password updated', 'Your password has been changed.')
    setCurrent(''); setNext(''); setConfirm(''); setDone(true)
  }

  return (
    <div className="max-w-[680px] space-y-6">
      <AdminPageHeader
        eyebrow="Account · Security"
        title="Account & security"
        description="Manage your sign-in credentials."
        breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Account' }]}
      />

      <AdminCard eyebrow="Security" title="Change password">
        <div className="space-y-4">
          <Field label="Current password" value={current} onChange={setCurrent} autoComplete="current-password" />
          <Field label="New password" value={next} onChange={setNext} autoComplete="new-password" hint="At least 10 characters, with a letter and a number." />
          <Field label="Confirm new password" value={confirm} onChange={setConfirm} autoComplete="new-password" />

          <div className="flex items-center justify-end pt-1">
            <button
              type="button"
              onClick={submit}
              disabled={saving}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white bg-[#0F766E] hover:bg-[#0F4C4C] px-4 py-2.5 rounded-[3px] border border-[#0F4C4C] disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : done ? <Check className="w-3.5 h-3.5" /> : <KeyRound className="w-3.5 h-3.5" />}
              Update password
            </button>
          </div>
        </div>
      </AdminCard>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  autoComplete,
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  autoComplete?: string
  hint?: string
}) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5 block">{label}</label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="input"
      />
      {hint && <p className="mt-1 font-mono text-[10.5px] text-[#5F6E6D]">{hint}</p>}
    </div>
  )
}
