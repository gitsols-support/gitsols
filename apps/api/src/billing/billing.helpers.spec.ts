import { describe, it, expect } from 'vitest'
import { computeTotals, formatDocNumber, normalizeItems, serializeLineItem } from './billing.helpers'

describe('computeTotals', () => {
  it('sums line items', () => {
    const t = computeTotals([{ qty: 10, unitPrice: 75 }, { qty: 1, unitPrice: 2000 }], 0, 0)
    expect(t.subtotal).toBe(2750)
    expect(t.total).toBe(2750)
  })

  it('applies discount before tax and rounds tax', () => {
    const t = computeTotals([{ qty: 10, unitPrice: 75 }, { qty: 1, unitPrice: 2000 }], 7, 250)
    expect(t.subtotal).toBe(2750)
    expect(t.taxAmount).toBe(175) // round(2500 * 0.07)
    expect(t.total).toBe(2675)
  })

  it('never taxes below zero when discount exceeds subtotal', () => {
    const t = computeTotals([{ qty: 1, unitPrice: 100 }], 10, 500)
    expect(t.subtotal).toBe(100)
    expect(t.taxAmount).toBe(0)
    expect(t.total).toBe(0)
  })
})

describe('formatDocNumber', () => {
  it('zero-pads with year prefix', () => {
    const d = new Date('2026-03-01T00:00:00Z')
    expect(formatDocNumber('INV', 42, d)).toBe('INV-2026-0042')
    expect(formatDocNumber('PRO', 1, d)).toBe('PRO-2026-0001')
  })
})

describe('normalizeItems + serializeLineItem', () => {
  it('defaults fields and computes lineTotal', () => {
    const norm = normalizeItems([{ description: 'Endpoints', qty: 5, unitPrice: 75 }])
    expect(norm[0]).toMatchObject({ qty: 5, unitPrice: 75, unit: 'fixed', recurring: false, sortOrder: 0 })
    const ser = serializeLineItem({ id: 'x', ...norm[0] })
    expect(ser.lineTotal).toBe(375)
    expect(ser.serviceSlug).toBeUndefined()
  })
})
