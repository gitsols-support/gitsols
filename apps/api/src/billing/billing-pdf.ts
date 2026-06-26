// Lay an Invoice or Proposal onto a PdfDoc. Shared layout — the two documents
// differ only in title, the date labels, and the totals tail (invoices show
// Amount Paid / Balance Due).

import { COMPANY } from '@gitsols/constants'
import type { Invoice, Proposal, BillingLineItem } from '@gitsols/types'
import { PdfDoc, LEFT_EDGE, RIGHT_EDGE, MARGIN } from './pdf.util'

const INK: [number, number, number] = [0.02, 0.18, 0.18]
const MUTED: [number, number, number] = [0.37, 0.43, 0.43]
const ACCENT: [number, number, number] = [0.06, 0.3, 0.3]
const RULE: [number, number, number] = [0.83, 0.88, 0.87]

function money(n: number, currency: string): string {
  const sign = n < 0 ? '-' : ''
  const v = Math.abs(Math.round(n)).toLocaleString('en-US')
  const sym = currency === 'USD' ? '$' : `${currency} `
  return `${sign}${sym}${v}`
}

function fmtDate(d?: string): string {
  if (!d) return '—'
  const dt = new Date(d.length <= 10 ? `${d}T00:00:00Z` : d)
  if (Number.isNaN(dt.getTime())) return d
  return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
}

// Column geometry for the line-item table.
const COL_QTY = RIGHT_EDGE - 230
const COL_RATE = RIGHT_EDGE - 110
const COL_AMT = RIGHT_EDGE

interface DocModel {
  kind: 'INVOICE' | 'PROPOSAL'
  number: string
  title: string
  status: string
  clientName: string
  clientEmail?: string
  accountName?: string
  engagementName?: string
  dateRows: { label: string; value: string }[]
  lineItems: BillingLineItem[]
  currency: string
  subtotal: number
  discount: number
  taxRate: number
  taxAmount: number
  total: number
  totalsTail: { label: string; value: string; strong?: boolean }[]
  notes?: string
  terms?: string
}

function render(model: DocModel): Buffer {
  const doc = new PdfDoc()
  doc.newPage()
  doc.moveTo(MARGIN)

  // ── Masthead ───────────────────────────────────────────────────────────────
  doc.text(LEFT_EDGE, COMPANY.brand, { font: 'bold', size: 22, color: INK })
  doc.gap(16)
  doc.text(LEFT_EDGE, COMPANY.legalName, { size: 9, color: MUTED })
  doc.gap(12)
  doc.text(LEFT_EDGE, COMPANY.address.street, { size: 9, color: MUTED })
  doc.gap(11)
  doc.text(LEFT_EDGE, `${COMPANY.address.city}, ${COMPANY.address.regionCode} ${COMPANY.address.postalCode}`, { size: 9, color: MUTED })
  doc.gap(11)
  doc.text(LEFT_EDGE, `${COMPANY.phone} · ${COMPANY.email}`, { size: 9, color: MUTED })

  // Document label block, right-aligned.
  doc.moveTo(MARGIN)
  doc.textRight(RIGHT_EDGE, model.kind, { font: 'bold', size: 22, color: ACCENT })
  doc.gap(18)
  doc.textRight(RIGHT_EDGE, model.number, { font: 'monoBold', size: 11, color: INK })
  doc.gap(13)
  doc.textRight(RIGHT_EDGE, `Status: ${model.status.toUpperCase()}`, { size: 9, color: MUTED })
  doc.gap(13)
  for (const row of model.dateRows) {
    doc.textRight(RIGHT_EDGE, `${row.label}: ${row.value}`, { size: 9, color: MUTED })
    doc.gap(12)
  }

  // ── Bill-to ──────────────────────────────────────────────────────────────────
  doc.moveTo(MARGIN + 92)
  doc.line(LEFT_EDGE, doc.y, RIGHT_EDGE, doc.y, { color: RULE })
  doc.gap(18)
  doc.text(LEFT_EDGE, 'BILL TO', { font: 'bold', size: 8, color: MUTED })
  doc.gap(14)
  doc.text(LEFT_EDGE, model.clientName || '—', { font: 'bold', size: 11, color: INK })
  if (model.clientEmail) {
    doc.gap(12)
    doc.text(LEFT_EDGE, model.clientEmail, { size: 9, color: MUTED })
  }
  const meta: string[] = []
  if (model.accountName) meta.push(`Account: ${model.accountName}`)
  if (model.engagementName) meta.push(`Project: ${model.engagementName}`)
  if (meta.length) {
    doc.gap(12)
    doc.text(LEFT_EDGE, meta.join('   ·   '), { size: 9, color: MUTED })
  }
  if (model.title) {
    doc.gap(14)
    doc.text(LEFT_EDGE, model.title, { font: 'bold', size: 12, color: INK })
  }

  // ── Line-item table ──────────────────────────────────────────────────────────
  doc.gap(24)
  const headY = doc.y
  doc.rect(LEFT_EDGE, headY - 4, RIGHT_EDGE - LEFT_EDGE, 20, [0.95, 0.97, 0.97])
  doc.text(LEFT_EDGE + 6, 'DESCRIPTION', { font: 'bold', size: 8, color: MUTED })
  doc.textRight(COL_QTY, 'QTY', { font: 'bold', size: 8, color: MUTED })
  doc.textRight(COL_RATE, 'UNIT PRICE', { font: 'bold', size: 8, color: MUTED })
  doc.textRight(COL_AMT - 6, 'AMOUNT', { font: 'bold', size: 8, color: MUTED })
  doc.gap(22)

  for (const li of model.lineItems) {
    if (doc.y > 720) {
      doc.newPage()
      doc.moveTo(MARGIN)
    }
    const desc = li.recurring ? `${li.description}  (recurring · ${li.unit})` : li.description
    doc.text(LEFT_EDGE + 6, desc.slice(0, 64), { size: 10, color: INK })
    doc.textRight(COL_QTY, String(li.qty), { font: 'mono', size: 10, color: INK })
    doc.textRight(COL_RATE, money(li.unitPrice, model.currency), { font: 'mono', size: 10, color: INK })
    doc.textRight(COL_AMT - 6, money(li.lineTotal, model.currency), { font: 'mono', size: 10, color: INK })
    doc.gap(8)
    doc.line(LEFT_EDGE, doc.y, RIGHT_EDGE, doc.y, { color: [0.91, 0.94, 0.94] })
    doc.gap(12)
  }
  if (model.lineItems.length === 0) {
    doc.text(LEFT_EDGE + 6, 'No line items.', { size: 10, color: MUTED })
    doc.gap(14)
  }

  // ── Totals ───────────────────────────────────────────────────────────────────
  doc.gap(8)
  const labelX = COL_RATE
  const rows: { label: string; value: string; strong?: boolean }[] = [
    { label: 'Subtotal', value: money(model.subtotal, model.currency) },
  ]
  if (model.discount > 0) rows.push({ label: 'Discount', value: `-${money(model.discount, model.currency)}` })
  rows.push({ label: `Tax (${model.taxRate}%)`, value: money(model.taxAmount, model.currency) })
  rows.push({ label: 'Total', value: money(model.total, model.currency), strong: true })
  rows.push(...model.totalsTail)

  for (const r of rows) {
    if (r.strong) {
      doc.line(labelX - 8, doc.y - 4, RIGHT_EDGE, doc.y - 4, { color: RULE })
      doc.gap(6)
    }
    doc.text(labelX, r.label, { font: r.strong ? 'bold' : 'body', size: r.strong ? 11 : 9, color: r.strong ? INK : MUTED })
    doc.textRight(COL_AMT, r.value, { font: r.strong ? 'monoBold' : 'mono', size: r.strong ? 11 : 10, color: r.strong ? INK : INK })
    doc.gap(r.strong ? 16 : 13)
  }

  // ── Notes / terms ──────────────────────────────────────────────────────────────
  if (model.notes || model.terms) {
    doc.gap(14)
    doc.line(LEFT_EDGE, doc.y, RIGHT_EDGE, doc.y, { color: RULE })
    doc.gap(16)
    if (model.notes) {
      doc.text(LEFT_EDGE, 'NOTES', { font: 'bold', size: 8, color: MUTED })
      doc.gap(13)
      for (const ln of wrap(model.notes, 96)) {
        doc.text(LEFT_EDGE, ln, { size: 9, color: INK })
        doc.gap(12)
      }
      doc.gap(6)
    }
    if (model.terms) {
      doc.text(LEFT_EDGE, 'TERMS', { font: 'bold', size: 8, color: MUTED })
      doc.gap(13)
      for (const ln of wrap(model.terms, 96)) {
        doc.text(LEFT_EDGE, ln, { size: 9, color: INK })
        doc.gap(12)
      }
    }
  }

  // ── Footer ───────────────────────────────────────────────────────────────────
  doc.moveTo(760)
  doc.line(LEFT_EDGE, doc.y, RIGHT_EDGE, doc.y, { color: RULE })
  doc.gap(12)
  doc.text(LEFT_EDGE, `${COMPANY.legalName} · ${COMPANY.serviceArea}`, { size: 8, color: MUTED })
  doc.textRight(RIGHT_EDGE, 'Thank you for your business.', { font: 'body', size: 8, color: MUTED })

  return doc.build()
}

function wrap(text: string, width: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > width) {
      if (cur) lines.push(cur)
      cur = w
    } else {
      cur = (cur + ' ' + w).trim()
    }
  }
  if (cur) lines.push(cur)
  return lines.slice(0, 12)
}

export function renderInvoicePdf(inv: Invoice): Buffer {
  return render({
    kind: 'INVOICE',
    number: inv.number,
    title: inv.title,
    status: inv.status,
    clientName: inv.clientName,
    clientEmail: inv.clientEmail,
    accountName: inv.accountName,
    engagementName: inv.engagementName,
    dateRows: [
      { label: 'Issued', value: fmtDate(inv.issueDate) },
      { label: 'Due', value: fmtDate(inv.dueDate) },
    ],
    lineItems: inv.lineItems,
    currency: inv.currency,
    subtotal: inv.subtotal,
    discount: inv.discount,
    taxRate: inv.taxRate,
    taxAmount: inv.taxAmount,
    total: inv.total,
    totalsTail:
      inv.amountPaid > 0
        ? [
            { label: 'Amount Paid', value: `-${money(inv.amountPaid, inv.currency)}` },
            { label: 'Balance Due', value: money(inv.balanceDue, inv.currency), strong: true },
          ]
        : [],
    notes: inv.notes,
    terms: inv.terms,
  })
}

export function renderProposalPdf(p: Proposal): Buffer {
  return render({
    kind: 'PROPOSAL',
    number: p.number,
    title: p.title,
    status: p.status,
    clientName: p.clientName,
    clientEmail: p.clientEmail,
    accountName: p.accountName,
    engagementName: p.engagementName,
    dateRows: [
      { label: 'Issued', value: fmtDate(p.issueDate) },
      { label: 'Valid until', value: fmtDate(p.validUntil) },
    ],
    lineItems: p.lineItems,
    currency: p.currency,
    subtotal: p.subtotal,
    discount: p.discount,
    taxRate: p.taxRate,
    taxAmount: p.taxAmount,
    total: p.total,
    totalsTail: [],
    notes: p.notes,
    terms: p.terms,
  })
}
