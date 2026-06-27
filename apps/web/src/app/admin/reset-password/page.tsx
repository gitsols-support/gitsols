'use client'

import { useState } from 'react'
import { Lock, ArrowRight, Loader2 } from 'lucide-react'
import { signOut } from 'next-auth/react'
import AuthShell from '@/components/auth/AuthShell'
import { IconInput } from '@/components/ui/IconInput'
import { changeMyPassword } from '@/server/admin-actions'

/**
 * Forced first-login password reset (route: /admin/reset-password).
 * Reached automatically (via middleware) when the signed-in user's
 * mustResetPassword flag is set. On success the user is signed out and must
 * sign back in with the new password.
 */
export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 10) {
      setError('Password must be at least 10 characters.')
      return
    }
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Password must contain at least one letter and one number.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    const res = await changeMyPassword(password)
    if (!res.ok) {
      setSubmitting(false)
      setError(res.error || 'Could not update password.')
      return
    }
    setDone(true)
    // Sign out so a fresh token is issued (clears the must-reset flag) and
    // the user re-authenticates with their new password.
    setTimeout(() => signOut({ callbackUrl: '/admin' }), 1200)
  }

  return (
    <AuthShell>
      <div className="space-y-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#14B8A6]/80 mb-1.5">
            Security
          </p>
          <h2 className="text-2xl font-bold text-[#0F4C4C]">Set a new password</h2>
          <p className="text-sm text-gray-500 mt-1">
            You&apos;re signing in for the first time. Choose a new password to continue.
          </p>
        </div>

        {done ? (
          <div className="rounded-lg border border-[#CFFAFA] bg-[#ECFEFE] px-3 py-3 text-sm text-[#0F4C4C]">
            Password updated. Redirecting you to sign in…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="text-xs font-medium text-gray-700 mb-1.5 block">
                New password
              </label>
              <IconInput
                icon={Lock}
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 10 chars, 1 letter + 1 number"
                autoComplete="new-password"
                required
              />
            </div>
            <div>
              <label htmlFor="confirm" className="text-xs font-medium text-gray-700 mb-1.5 block">
                Confirm password
              </label>
              <IconInput
                icon={Lock}
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter your new password"
                autoComplete="new-password"
                required
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#14B8A6] hover:bg-[#0D9488] text-white text-sm font-semibold px-4 py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Updating…
                </>
              ) : (
                <>
                  Set password &amp; continue <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </AuthShell>
  )
}
