'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { signIn } from 'next-auth/react'
import AuthShell from '@/components/auth/AuthShell'
import MicrosoftButton from '@/components/auth/MicrosoftButton'
import { IconInput } from '@/components/ui/IconInput'

/**
 * Sign-in page (route: /admin).
 *
 * Primary: email + password (verified against the API; allowlist-gated).
 * Alternatives, when configured: Microsoft SSO, and an emailed magic link.
 */
export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sendingLink, setSendingLink] = useState(false)
  const [microsoftLoading, setMicrosoftLoading] = useState(false)
  const [message, setMessage] = useState<{ kind: 'error' | 'info'; text: string } | null>(null)

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    if (!email || !password) {
      setMessage({ kind: 'error', text: 'Enter your email and password.' })
      return
    }
    setSubmitting(true)
    const res = await signIn('credentials', { email, password, redirect: false })
    setSubmitting(false)
    if (res?.error) {
      setMessage({ kind: 'error', text: 'Invalid email or password.' })
      return
    }
    // Middleware redirects to /admin/reset-password if a reset is required.
    router.push('/admin/dashboard')
  }

  async function handleMagicLink() {
    setMessage(null)
    if (!email) {
      setMessage({ kind: 'error', text: 'Enter your work email first.' })
      return
    }
    setSendingLink(true)
    try {
      const res = await signIn('postmark', { email, redirect: false, callbackUrl: '/admin/dashboard' })
      setMessage(
        res?.error
          ? { kind: 'error', text: 'Email sign-in is not configured. Use your password.' }
          : { kind: 'info', text: 'Check your email for a sign-in link.' },
      )
    } catch {
      setMessage({ kind: 'error', text: 'Email sign-in is not configured. Use your password.' })
    } finally {
      setSendingLink(false)
    }
  }

  async function handleMicrosoftSignIn() {
    setMicrosoftLoading(true)
    try {
      await signIn('microsoft-entra-id', { callbackUrl: '/admin/dashboard' })
    } catch {
      setMicrosoftLoading(false)
      setMessage({ kind: 'error', text: 'Microsoft SSO is not configured.' })
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
          <p className="text-sm text-gray-500 mt-1">Sign in to the GITSOLS admin.</p>
        </div>

        {/* Email + password */}
        <form onSubmit={handlePassword} className="space-y-4">
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
              placeholder="you@gitsols.com"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="text-xs font-medium text-gray-700 mb-1.5 block">
              Password
            </label>
            <IconInput
              icon={Lock}
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
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
            className="w-full inline-flex items-center justify-center gap-2 bg-[#0F4C4C] hover:bg-[#155E5E] text-white text-sm font-semibold px-4 py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Signing in…
              </>
            ) : (
              <>
                Sign in <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-[10px] uppercase tracking-[0.18em] text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Alternatives */}
        <div className="space-y-3">
          <MicrosoftButton onClick={handleMicrosoftSignIn} loading={microsoftLoading} />
          <button
            type="button"
            onClick={handleMagicLink}
            disabled={sendingLink}
            className="w-full inline-flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-[#0F4C4C] text-sm font-medium px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60"
          >
            {sendingLink ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            Email me a sign-in link
          </button>
        </div>

        {/* Back to landing */}
        <div className="pt-2 flex items-center justify-center">
          <Link href="/" className="text-[11px] text-gray-400 hover:text-[#0F4C4C] transition-colors">
            ← back to landing
          </Link>
        </div>
      </div>
    </AuthShell>
  )
}
