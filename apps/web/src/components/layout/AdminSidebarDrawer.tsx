'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  Briefcase,
  Building2,
  Code2,
  Command,
  Inbox,
  Pin,
  Search,
  Ticket,
  X,
} from 'lucide-react'
import {
  ACCOUNTS,
  BESPOKE_PROJECTS,
  LEADS,
  TICKETS,
  formatRelative,
} from '@/server/admin-stubs'

interface AdminSidebarDrawerProps {
  open: boolean
  onClose: () => void
}

/**
 * Slide-out drawer from the admin sidebar — quick search, recent items,
 * pinned actions. Esc closes; backdrop click closes; trapped to ~360px.
 */
export default function AdminSidebarDrawer({ open, onClose }: AdminSidebarDrawerProps) {
  const [query, setQuery] = useState('')

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  const q = query.trim().toLowerCase()
  const filterMatch = (s: string) => !q || s.toLowerCase().includes(q)

  const matchedLeads = LEADS.filter(
    (l) => filterMatch(l.name) || filterMatch(l.company),
  ).slice(0, 4)
  const matchedAccounts = ACCOUNTS.filter((a) => filterMatch(a.name)).slice(0, 4)
  const matchedTickets = TICKETS.filter(
    (t) => filterMatch(t.subject) || filterMatch(t.accountName) || filterMatch(t.id),
  ).slice(0, 4)
  const matchedProjects = BESPOKE_PROJECTS.filter(
    (p) => filterMatch(p.name) || filterMatch(p.accountName),
  ).slice(0, 3)

  const totalMatches =
    matchedLeads.length + matchedAccounts.length + matchedTickets.length + matchedProjects.length

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-[#062524]/40 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer panel — slides in from the sidebar */}
      <aside
        role="dialog"
        aria-label="Quick view"
        aria-modal="true"
        className="fixed top-0 bottom-0 left-0 z-50 w-[360px] max-w-[92vw] bg-[#082F2F] text-white border-r border-[#0F766E]/40 shadow-[18px_0_40px_-12px_rgba(0,0,0,0.5)] animate-slide-in-right flex flex-col"
        style={{
          // Make it slide from the sidebar edge: the sidebar is at most w-64 (256px) when expanded
          // and w-16 when collapsed. Push the drawer past the collapsed rail.
          marginLeft: '64px',
        }}
      >
        {/* Brass top accent */}
        <div className="h-[2px] bg-gradient-to-r from-[#0F766E] via-[#CFFAFA] to-[#0F766E] flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <Command className="w-4 h-4 text-[#0F766E]" />
            <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-white">
              Quick view
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[3px] text-white/60 hover:bg-white/10 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-4 border-b border-white/10 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search leads, accounts, tickets…"
              className="w-full bg-[#062524] border border-white/10 rounded-[3px] pl-9 pr-3 py-2.5 text-[13px] text-white placeholder:text-white/40 outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/30 transition-all"
            />
          </div>
          {q && (
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#0F766E]">
              {totalMatches} match{totalMatches === 1 ? '' : 'es'}
            </p>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto scrollbar-hidden">
          {/* Pinned actions — only show when no query */}
          {!q && (
            <Section label="Pinned">
              <PinnedAction icon={Inbox} label="New lead" href="/admin/leads" onClick={onClose} />
              <PinnedAction icon={Briefcase} label="New engagement" href="/admin/engagements" onClick={onClose} />
              <PinnedAction icon={Code2} label="New bespoke project" href="/admin/bespoke" onClick={onClose} />
              <PinnedAction icon={Ticket} label="New ticket" href="/admin/tickets" onClick={onClose} />
            </Section>
          )}

          {matchedLeads.length > 0 && (
            <Section label={q ? 'Leads' : 'Recent leads'} icon={Inbox}>
              {matchedLeads.map((l) => (
                <RowLink
                  key={l.id}
                  href={`/admin/leads/${l.id}`}
                  onClick={onClose}
                  title={l.name}
                  subtitle={`${l.company} · score ${l.score}`}
                  meta={formatRelative(l.receivedAt)}
                  badge={l.status}
                />
              ))}
            </Section>
          )}

          {matchedAccounts.length > 0 && (
            <Section label={q ? 'Accounts' : 'Recent accounts'} icon={Building2}>
              {matchedAccounts.map((a) => (
                <RowLink
                  key={a.id}
                  href={`/admin/accounts/${a.id}`}
                  onClick={onClose}
                  title={a.name}
                  subtitle={`${a.primaryContact} · ${a.tier}`}
                  meta={`${a.openTickets} open`}
                  badge={a.status}
                />
              ))}
            </Section>
          )}

          {matchedTickets.length > 0 && (
            <Section label={q ? 'Tickets' : 'Open tickets'} icon={Ticket}>
              {matchedTickets.map((t) => (
                <RowLink
                  key={t.id}
                  href={`/admin/tickets/${t.id}`}
                  onClick={onClose}
                  title={t.subject}
                  subtitle={`${t.id} · ${t.accountName}`}
                  meta={formatRelative(t.openedAt)}
                  badge={t.priority.toUpperCase()}
                  badgeTone={t.priority === 'p1' ? 'critical' : 'warn'}
                />
              ))}
            </Section>
          )}

          {matchedProjects.length > 0 && (
            <Section label={q ? 'Projects' : 'Bespoke in flight'} icon={Code2}>
              {matchedProjects.map((p) => (
                <RowLink
                  key={p.id}
                  href={`/admin/bespoke/${p.id}`}
                  onClick={onClose}
                  title={p.name}
                  subtitle={`${p.accountName} · ${p.stage}`}
                  meta={`${p.milestonesDone}/${p.milestonesTotal}`}
                  badge={p.health}
                  badgeTone={p.health === 'red' ? 'critical' : p.health === 'amber' ? 'warn' : 'ok'}
                />
              ))}
            </Section>
          )}

          {q && totalMatches === 0 && (
            <div className="px-5 py-10 text-center">
              <p className="font-serif text-[18px] text-white/80 tracking-[-0.005em]" style={{ fontFamily: 'var(--font-serif)' }}>
                No matches.
              </p>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-white/40 mt-2">
                Try fewer characters.
              </p>
            </div>
          )}
        </div>

        {/* Footer hints */}
        <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 flex-shrink-0">
          <span className="inline-flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/15 rounded-[2px] text-white/70">esc</kbd>
            close
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Pin className="w-3 h-3" />
            Quick view · GITSOLS
          </span>
        </div>
      </aside>
    </>
  )
}

function Section({
  label,
  icon: Icon,
  children,
}: {
  label: string
  icon?: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="px-3 py-3 border-b border-white/5 last:border-b-0">
      <div className="flex items-center gap-2 px-2 mb-2">
        {Icon && <Icon className="w-3 h-3 text-[#0F766E]" />}
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F766E]">{label}</p>
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

function PinnedAction({
  icon: Icon,
  label,
  href,
  onClick,
}: {
  icon: React.ElementType
  label: string
  href: string
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-2 py-2 rounded-[3px] hover:bg-white/[0.06] transition-colors group"
    >
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-[3px] bg-[#0F4C4C] border border-[#0F766E]/40 flex-shrink-0">
        <Icon className="w-3.5 h-3.5 text-[#CFFAFA]" />
      </span>
      <span className="text-[13px] text-white flex-1 truncate">{label}</span>
      <ArrowUpRight className="w-3.5 h-3.5 text-white/30 group-hover:text-[#0F766E] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
    </Link>
  )
}

function RowLink({
  href,
  onClick,
  title,
  subtitle,
  meta,
  badge,
  badgeTone = 'default',
}: {
  href: string
  onClick: () => void
  title: string
  subtitle: string
  meta?: string
  badge?: string
  badgeTone?: 'default' | 'ok' | 'warn' | 'critical'
}) {
  const toneClass: Record<string, string> = {
    default: 'bg-[#0F4C4C] text-[#CFFAFA] border-[#0F766E]/40',
    ok: 'bg-[#0F766E] text-white border-[#0F766E]',
    warn: 'bg-[#7A5A1F]/80 text-[#FAEFD4] border-[#C5933A]/40',
    critical: 'bg-[#B53A2B]/80 text-white border-[#B53A2B]',
  }
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-2 py-2 rounded-[3px] hover:bg-white/[0.06] transition-colors"
    >
      <div className="flex items-start justify-between gap-2 mb-0.5">
        <p
          className="font-serif text-[14px] text-white leading-tight tracking-[-0.005em] truncate flex-1"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {title}
        </p>
        {badge && (
          <span
            className={`flex-shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] px-1.5 py-0.5 rounded-[2px] border ${toneClass[badgeTone]}`}
          >
            {badge}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 font-mono text-[10.5px] text-white/55">
        <span className="truncate">{subtitle}</span>
        {meta && <span className="text-white/40 flex-shrink-0">{meta}</span>}
      </div>
    </Link>
  )
}
