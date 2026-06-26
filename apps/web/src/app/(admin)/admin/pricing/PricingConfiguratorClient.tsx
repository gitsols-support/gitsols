'use client'

import { useState, useTransition } from 'react'
import { Plus, Save, Trash2, Loader2, Tags, Check } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { useToast } from '@/components/admin/Toast'
import { createServiceLine, updateServiceLine, deleteServiceLine } from '@/server/admin-actions'
import type { ServiceCatalogItem, BillingUnit, ServiceCatalogCategory } from '@gitsols/types'

const UNITS: BillingUnit[] = ['per-seat-month', 'per-month', 'fixed', 'hourly', 'retainer']
const CATEGORIES: ServiceCatalogCategory[] = ['managed', 'security', 'cloud', 'communications', 'build', 'marketing']

export default function PricingConfiguratorClient({ services }: { services: ServiceCatalogItem[] }) {
  const { push } = useToast()
  const [pending, start] = useTransition()
  const [rows, setRows] = useState(services)
  const [dirty, setDirty] = useState<Record<string, boolean>>({})

  // New-line form
  const [showNew, setShowNew] = useState(false)
  const [nName, setNName] = useState('')
  const [nCategory, setNCategory] = useState<ServiceCatalogCategory>('managed')
  const [nRate, setNRate] = useState(0)
  const [nUnit, setNUnit] = useState<BillingUnit>('per-seat-month')

  function patch(id: string, p: Partial<ServiceCatalogItem>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)))
    setDirty((d) => ({ ...d, [id]: true }))
  }

  function saveRow(row: ServiceCatalogItem) {
    start(async () => {
      const res = await updateServiceLine(row.id, {
        name: row.name,
        category: row.category,
        defaultRate: row.defaultRate,
        billingUnit: row.billingUnit,
        active: row.active,
      })
      if (!res.ok) push('error', 'Save failed', res.error)
      else {
        push('success', 'Price updated', row.name)
        setDirty((d) => ({ ...d, [row.id]: false }))
      }
    })
  }

  function removeRow(row: ServiceCatalogItem) {
    if (!confirm(`Delete "${row.name}" from the catalog?`)) return
    start(async () => {
      const res = await deleteServiceLine(row.id)
      if (!res.ok) push('error', 'Delete failed', res.error)
      else {
        push('success', 'Removed', row.name)
        setRows((rs) => rs.filter((r) => r.id !== row.id))
      }
    })
  }

  function addLine() {
    if (!nName.trim()) {
      push('error', 'Name required', 'Give the service a name.')
      return
    }
    const slug = nName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '').slice(0, 72)
    start(async () => {
      const res = await createServiceLine({ slug, name: nName.trim(), category: nCategory, defaultRate: nRate, billingUnit: nUnit, active: true })
      if (!res.ok) push('error', 'Could not add', res.error)
      else {
        push('success', 'Service added', res.data.name)
        setRows((rs) => [...rs, res.data])
        setShowNew(false)
        setNName(''); setNRate(0)
      }
    })
  }

  const activeCount = rows.filter((r) => r.active).length
  const recurring = rows.filter((r) => r.billingUnit !== 'fixed' && r.billingUnit !== 'hourly').length

  return (
    <div className="max-w-[1300px] space-y-6">
      <AdminPageHeader
        eyebrow="Billing · Pricing configurator"
        title="Pricing configurator"
        description="Set the rate and billing unit for each service. These prices feed the catalog picker on proposals and invoices."
        breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Billing' }, { label: 'Pricing' }]}
        stats={[
          { label: 'Service lines', value: rows.length },
          { label: 'Active', value: activeCount },
          { label: 'Recurring', value: recurring },
          { label: 'One-off', value: rows.length - recurring },
        ]}
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowNew((s) => !s)}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white bg-[#0F766E] hover:bg-[#0F4C4C] px-4 py-2 rounded-[3px] border border-[#0F4C4C]"
        >
          <Plus className="w-3.5 h-3.5" /> {showNew ? 'Close' : 'Add service line'}
        </button>
      </div>

      {showNew && (
        <AdminCard eyebrow="New" title="Add a service line">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <Label>Name</Label>
              <input className="input" value={nName} onChange={(e) => setNName(e.target.value)} placeholder="Managed IT — Standard" />
            </div>
            <div>
              <Label>Category</Label>
              <select className="input" value={nCategory} onChange={(e) => setNCategory(e.target.value as ServiceCatalogCategory)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Rate ($)</Label>
                <input className="input" type="number" min={0} value={nRate} onChange={(e) => setNRate(Number(e.target.value))} />
              </div>
              <div>
                <Label>Unit</Label>
                <select className="input" value={nUnit} onChange={(e) => setNUnit(e.target.value as BillingUnit)}>
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="button" onClick={addLine} disabled={pending} className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white bg-[#0F766E] hover:bg-[#0F4C4C] px-4 py-2 rounded-[3px] border border-[#0F4C4C] disabled:opacity-60">
              {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Add line
            </button>
          </div>
        </AdminCard>
      )}

      <AdminCard flush eyebrow="Rate card" title={`${rows.length} service line${rows.length === 1 ? '' : 's'}`}>
        {rows.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Tags className="w-8 h-8 mx-auto text-[#9aa6a4] mb-3" />
            <p className="text-[14px] text-[#0F4C4C] font-semibold">No service lines yet</p>
            <p className="text-[12.5px] text-[#5F6E6D] mt-1">Add your first priced service above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left font-mono text-[10px] uppercase tracking-[0.16em] text-[#5F6E6D] border-b border-[#D5E0DE]">
                  <th className="px-6 py-3 font-medium">Service</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium text-right">Rate ($)</th>
                  <th className="px-4 py-3 font-medium">Billing unit</th>
                  <th className="px-4 py-3 font-medium text-center">Active</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-[#EDF2F1]">
                    <td className="px-6 py-2.5">
                      <input className="input !py-1.5" value={r.name} onChange={(e) => patch(r.id, { name: e.target.value })} />
                    </td>
                    <td className="px-4 py-2.5">
                      <select className="input !py-1.5 !w-auto" value={r.category} onChange={(e) => patch(r.id, { category: e.target.value as ServiceCatalogCategory })}>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2.5">
                      <input className="input !py-1.5 text-right tabular-nums" type="number" min={0} value={r.defaultRate} onChange={(e) => patch(r.id, { defaultRate: Number(e.target.value) })} />
                    </td>
                    <td className="px-4 py-2.5">
                      <select className="input !py-1.5 !w-auto" value={r.billingUnit} onChange={(e) => patch(r.id, { billingUnit: e.target.value as BillingUnit })}>
                        {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <input type="checkbox" className="w-4 h-4 accent-[#0F766E]" checked={r.active} onChange={(e) => patch(r.id, { active: e.target.checked })} />
                    </td>
                    <td className="px-6 py-2.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => saveRow(r)}
                          disabled={pending || !dirty[r.id]}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[3px] border text-[11px] font-mono uppercase tracking-[0.1em] ${dirty[r.id] ? 'text-white bg-[#0F766E] border-[#0F4C4C]' : 'text-[#9aa6a4] bg-white border-[#D5E0DE]'}`}
                        >
                          {dirty[r.id] ? <Save className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                          {dirty[r.id] ? 'Save' : 'Saved'}
                        </button>
                        <button type="button" onClick={() => removeRow(r)} disabled={pending} className="inline-flex items-center justify-center w-7 h-7 rounded-[3px] border border-[#F5C9C0] text-[#B53A2B] hover:bg-[#FBE6E1]" aria-label="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5 block">{children}</label>
}
