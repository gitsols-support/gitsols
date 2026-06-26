'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowRight, Loader2 } from 'lucide-react'
import { signIn } from 'next-auth/react'
import AuthShell from '@/components/auth/AuthShell'
import MicrosoftButton from '@/components/auth/MicrosoftButton'
import { IconInput } from '@/components/ui/IconInput'

// Note: page-level metadata in a 'use client' file is not supported by Next.
// If you need a per-route <title>, move metadata into a co-located server
// layout.tsx for /admin (apps/web/src/app/admin/layout.tsx).

/**
 * Sign-in page (route: /admin).
 *
 * Three sign-in paths — each available only when the corresponding env vars
 * are configured (see `src/auth.ts`):
 *
 *   1. Microsoft SSO (Entra ID)
 *   2. Google SSO (Workspace)
 *   3. Email magic link (Postmark)
 *
 * In Phase 0 with no providers configured, only the "dev mode" shortcut
 * works — useful for clicking through the admin shell without auth.
 */
export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [microsoftLoading, setMicrosoftLoading] = useState(false)
  const [message, setMessage] = useState<{ kind: 'error' | 'info'; text: string } | null>(null)

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    if (!email) {
      setMessage({ kind: 'error', text: 'Enter your work email.' })
      return
    }
    setSubmitting(true)
    try {
      const res = await signIn('postmark', {
        email,
        redirect: false,
        callbackUrl: '/admin/dashboard',
      })
      if (res?.error) {
        setMessage({
          kind: 'error',
          text: 'Email sign-in is not configured yet. Use SSO or the dev shortcut.',
        })
      } else {
        setMessage({
          kind: 'info',
          text: 'Check your email for a sign-in link.',
        })
      }
    } catch {
      setMessage({
        kind: 'error',
        text: 'Email sign-in is not configured yet. Use SSO or the dev shortcut.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleMicrosoftSignIn() {
    setMicrosoftLoading(true)
    try {
      await signIn('microsoft-entra-id', { callbackUrl: '/admin/dashboard' })
    } catch {
      setMicrosoftLoading(false)
      setMessage({
        kind: 'error',
        text: 'Microsoft SSO is not configured yet. Use the dev shortcut.',
      })
    }
  }

  return (
    <AuthShell>
      <div className="space-y-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#14B8A6]/80 mb-1.5">
            Sign in
          </p>
          <h2 className="text-2xl font-bold text-[#0F4C4C]">Welcome back</h2>
          <p className="text-sm text-gray-500 mt-1">
            Use Microsoft SSO or have a sign-in link emailed to you.
          </p>
        </div>

        {/* Microsoft SSO */}
        <MicrosoftButton onClick={handleMicrosoftSignIn} loading={microsoftLoading} />

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-[10px] uppercase tracking-[0.18em] text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Magic link */}
        <form onSubmit={handleMagicLink} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-xs font-medium text-gray-700 mb-1.5 block">
              Work email
            </label>
            <IconInput
              icon={Mail}
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
              required
            />
          </div>

          {message && (
            <div
              className={
                message.kind === 'error'
                  ? 'rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700'
                  : 'rounded-lg border border-[#CFFAFA] bg-[#ECFEFE] px-3 py-2 text-xs text-[#0F4C4C]'
              }
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#14B8A6] hover:bg-[#0D9488] text-white text-sm font-semibold px-4 py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Sending link…
              </>
            ) : (
              <>
                Email me a sign-in link <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Dev bypass — auth-free shortcut into the admin shell. Enabled
            by ADMIN_DEV_BYPASS=true in env (rejected in production). */}
        <div className="pt-5 border-t border-gray-100">
          <div className="rounded-[3px] border border-dashed border-[#0F766E]/40 bg-[#ECFEFE] px-4 py-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6] animate-pulse" />
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F766E] font-medium">
                Dev mode · auth bypass
              </p>
            </div>
            <p className="text-[12px] text-[#5F6E6D] leading-relaxed mb-3">
              Skip sign-in and load the admin shell directly. Requires{' '}
              <code className="font-mono text-[11px] bg-white px-1 py-0.5 rounded text-[#0F4C4C] border border-[#D5E0DE]">
                ADMIN_DEV_BYPASS=true
              </code>{' '}
              in <code className="font-mono text-[11px] bg-white px-1 py-0.5 rounded text-[#0F4C4C] border border-[#D5E0DE]">.env</code>.
            </p>
            <Link
              href="/admin/dashboard?dev=1"
              className="group inline-flex items-center gap-1.5 bg-[#0F4C4C] hover:bg-[#082F2F] text-white text-[12px] font-semibold pl-4 pr-3 py-2 rounded-[3px] transition-colors border border-[#082F2F] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
            >
              Enter admin dashboard
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Back to landing */}
        <div className="pt-2 flex items-center justify-center">
          <Link
            href="/"
            className="text-[11px] text-gray-400 hover:text-[#0F4C4C] transition-colors"
          >
            ← back to landing
          </Link>
        </div>
      </div>
    </AuthShell>
  )
}
