// Shared money math + document numbering for proposals and invoices.

import type { BillingLineItem, BillingLineItemInput } from '@gitsols/types'

export interface Totals {
  subtotal: number
  taxAmount: number
  total: number
}

/** All amounts are whole dollars. Tax applies to (subtotal − discount). */
export function computeTotals(
  items: { qty: number; unitPrice: number }[],
  taxRate: number,
  discount: number,
): Totals {
  const subtotal = items.reduce((s, li) => s + Math.max(0, li.qty) * Math.max(0, li.unitPrice), 0)
  const taxable = Math.max(0, subtotal - Math.max(0, discount))
  const taxAmount = Math.round((taxable * Math.max(0, taxRate)) / 100)
  const total = taxable + taxAmount
  return { subtotal, taxAmount, total }
}

export function normalizeItems(items: BillingLineItemInput[] | undefined): {
  serviceSlug: string | null
  description: string
  qty: number
  unitPrice: number
  unit: string
  recurring: boolean
  sortOrder: number
}[] {
  return (items ?? []).map((li, i) => ({
    serviceSlug: li.serviceSlug ?? null,
    description: li.description,
    qty: li.qty ?? 1,
    unitPrice: li.unitPrice ?? 0,
    unit: li.unit ?? 'fixed',
    recurring: li.recurring ?? false,
    sortOrder: i,
  }))
}

export function serializeLineItem(row: {
  id: string
  serviceSlug: string | null
  description: string
  qty: number
  unitPrice: number
  unit: string
  recurring: boolean
  sortOrder: number
}): BillingLineItem {
  return {
    id: row.id,
    serviceSlug: row.serviceSlug ?? undefined,
    description: row.description,
    qty: row.qty,
    unitPrice: row.unitPrice,
    unit: row.unit,
    recurring: row.recurring,
    sortOrder: row.sortOrder,
    lineTotal: row.qty * row.unitPrice,
  }
}

/** e.g. INV-2026-0042. `seq` is a 1-based running count. */
export function formatDocNumber(prefix: 'INV' | 'PRO', seq: number, now = new Date()): string {
  return `${prefix}-${now.getUTCFullYear()}-${String(seq).padStart(4, '0')}`
}
