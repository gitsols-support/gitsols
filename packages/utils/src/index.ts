import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ─── Tailwind class merging ──────────────────────────────────────────────────

/**
 * Merge tailwind class lists, resolving conflicts (later classes win).
 * Use this everywhere you compose conditional class names.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// ─── String helpers ──────────────────────────────────────────────────────────

export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function titleCase(str: string): string {
  return str.split('-').map(capitalize).join(' ')
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '…'
}

// ─── Number & currency formatting ────────────────────────────────────────────

export function formatCurrency(
  amount: number,
  currency = 'USD',
  locale = 'en-US',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

// ─── Date & time helpers ─────────────────────────────────────────────────────

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(iso)
}
