'use client'

// /portal — client login.
//
// Distinct from /admin (internal staff sign-in with SSO + magic link).
// Client portal uses email + password only — no SSO, no magic link, no
// passkey today. Phase 3 wires the real credentials provider on Auth.js;
// for now this page collects credentials and posts to a stub /api/v1/auth/
// client-login endpoint that returns 501 (not yet wired).

import { useState } from 'react'
import Link from 'next/link'
import {
  Mail,
  KeyRound,
  ArrowRight,
  Loader2,
  Phone,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react'
import Wordmark from '@/components/marketing/Wordmark'

export default function ClientPortalLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState<{
    kind: 'error' | 'info'
    text: string
  } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    if (!email || !password) {
      setMessage({ kind: 'error', text: 'Enter your email and password.' })
      return
    }
    setSubmitting(true)
    try {
      // Phase 3 will replace this with a real credentials sign-in. For now
      // show a deliberate "coming soon" message rather than failing silently.
      await new Promise((r) => setTimeout(r, 600))
      setMessage({
        kind: 'info',
        text:
          'Client portal launches once your engagement begins. If you have an active engagement, call 888-503-0666 and we will get you in today.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#F4F8F7] text-[#062524]">
      {/* ── Brand panel — same recipe as PageHero ── */}
      <aside className="hidden lg:flex lg:w-1/2 xl:w-2/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F4C4C] via-[#0A3A3A] to-[#070F2C]" />
        <div
          className="absolute inset-0 opacity-25 mix-blend-overlay"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, #155E5E 0%, transparent 40%), radial-gradient(circle at 80% 70%, #14B8A6 0%, transparent 35%)',
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
          aria-hidden
        />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full text-white">
          <Link href="/" className="inline-block">
            <Wordmark tone="dark" height={44} />
            <span className="block font-mono text-[9px] uppercase tracking-[0.24em] text-[#14B8A6] mt-3">
              Client portal
            </span>
          </Link>

          <div className="space-y-7">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#14B8A6]">
                For active clients
              </p>
              <h1
                className="mt-4 font-serif text-4xl xl:text-5xl leading-[1.04] tracking-[-0.022em]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Your engagement,
                <br />
                live and on the record.
              </h1>
              <p className="mt-5 text-[14px] text-white/65 leading-relaxed max-w-md">
                Milestones, approvals, deliverables, tickets, and invoices —
                visible the moment they change.
              </p>
            </div>

            <ul className="space-y-3 pt-2 text-[12.5px] text-white/70">
              <li className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-white/80" />
                </span>
                MFA-enforced · audit-logged
              </li>
              <li className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-white/80" />
                </span>
                HIPAA-aware infrastructure, NJ-hosted
              </li>
              <li className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-white/80" />
                </span>
                24/7 GITSOLS NOC monitoring your systems
              </li>
            </ul>
          </div>

          <div className="text-[10px] text-white/40">
            <span>© 2026 GITSOLS LLC · Restricted system</span>
          </div>
        </div>
      </aside>

      {/* ── Form panel ── */}
      <main className="flex-1 flex flex-col bg-white">
        {/* Mobile masthead */}
        <div className="lg:hidden h-14 px-5 flex items-center justify-between border-b border-[#E1DDD0]">
          <Link href="/" className="inline-flex items-center">
            <Wordmark tone="light" height={28} />
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D]">
            Client portal
          </span>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md animate-fade-in">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F766E]">
              Sign in
            </p>
            <h2
              className="mt-2 font-serif text-3xl text-[#0F4C4C] leading-tight tracking-[-0.012em]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Welcome back.
            </h2>
            <p className="mt-2 text-[14px] text-[#5F6E6D]">
              Use your client portal email and password.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#5F6E6D] mb-2"
                >
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-[3px] bg-[#ECFEFE] border border-[#D5E0DE]">
                    <Mail className="w-3 h-3 text-[#0F4C4C]" />
                  </span>
                  Work email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="you@company.com"
                  className="w-full bg-[#F4F8F7] border border-[#D5E0DE] rounded-[3px] px-4 py-3 text-[14.5px] text-[#0F4C4C] placeholder:text-[#5F6E6D]/50 outline-none transition-colors focus:border-[#0F766E] focus:bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="password"
                    className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#5F6E6D]"
                  >
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-[3px] bg-[#ECFEFE] border border-[#D5E0DE]">
                      <KeyRound className="w-3 h-3 text-[#0F4C4C]" />
                    </span>
                    Password
                  </label>
                  <Link
                    href="/portal/reset"
                    className="text-[11px] text-[#0F4C4C]/70 hover:text-[#0F4C4C] hover:underline"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full bg-[#F4F8F7] border border-[#D5E0DE] rounded-[3px] px-4 py-3 pr-20 text-[14.5px] text-[#0F4C4C] placeholder:text-[#5F6E6D]/50 outline-none transition-colors focus:border-[#0F766E] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#5F6E6D] hover:text-[#0F4C4C]"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {message && (
                <div
                  className={
                    message.kind === 'error'
                      ? 'rounded-[3px] border-l-2 border-red-500 bg-red-50 px-3 py-2 text-[12.5px] text-red-700'
                      : 'rounded-[3px] border-l-2 border-[#0F766E] bg-[#ECFEFE] px-3 py-2 text-[12.5px] text-[#0F4C4C]'
                  }
                >
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#0F4C4C] hover:bg-[#082F2F] text-white text-[13.5px] font-semibold px-4 py-3.5 rounded-[3px] transition-colors disabled:opacity-60 disabled:cursor-not-allowed border border-[#082F2F] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
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

            {/* Helper rail */}
            <div className="mt-8 pt-6 border-t border-[#E1DDD0] space-y-3 text-[12.5px] text-[#5F6E6D]">
              <p className="flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 mt-0.5 text-[#0F766E] flex-shrink-0" />
                <span>
                  Don&apos;t have an account yet? Portal access is provisioned
                  on engagement kickoff. If we are working together and you need
                  a login, ask your PM.
                </span>
              </p>
              <p className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 mt-0.5 text-[#0F766E] flex-shrink-0" />
                <span>
                  Locked out or system issue? Call{' '}
                  <a
                    href="tel:8885030666"
                    className="font-mono text-[#0F4C4C] hover:underline"
                  >
                    888-503-0666
                  </a>{' '}
                  — 24/7 for current clients.
                </span>
              </p>
            </div>

            <div className="mt-6 text-[11px] text-[#5F6E6D]/70">
              <Link href="/" className="hover:text-[#0F4C4C] transition-colors">
                ← gitsols.com
              </Link>
            </div>
          </div>
        </div>

        <footer className="px-6 sm:px-10 pb-6 font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D]/70">
          This is a private system. All access is logged and monitored.
        </footer>
      </main>
    </div>
  )
}
