'use client'

import { useState } from 'react'
import { ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import type { CreateLeadRequest, LeadSource } from '@gitsols/types'
import { SERVICES, INDUSTRIES } from '@gitsols/constants'
import { env } from '@/env'

interface LeadFormProps {
  source: LeadSource
  /** Default service slug — used on /services/[slug] inquiry forms. */
  defaultServiceInterest?: string
  /** Default industry slug — used on /industries/[slug] forms. */
  defaultIndustry?: string
  /** Override the heading. */
  heading?: string
  /** Override the body line under the heading. */
  body?: string
  /** Override the submit button copy. */
  submitLabel?: string
  /** Show the industry select. */
  showIndustry?: boolean
  /** Show the service-interest select. */
  showServiceInterest?: boolean
  /** Compact vertical-stack form, vs. roomier two-column layout. */
  compact?: boolean
}

/**
 * Single lead-capture form used across /contact, /free-it-audit, and the
 * per-service inquiry blocks. POSTs to /api/v1/leads on the Nest API.
 *
 * Phase 1 keeps validation minimal — server-side Zod is the source of truth.
 * Client-side just disables submit while in-flight and shows success/error
 * state.
 */
export default function LeadForm({
  source,
  defaultServiceInterest,
  defaultIndustry,
  heading = 'Talk to the GITSOLS team',
  body = 'A real engineer responds within one business day.',
  submitLabel = 'Send message',
  showIndustry = false,
  showServiceInterest = true,
  compact = false,
}: LeadFormProps) {
  const [state, setState] = useState<
    | { kind: 'idle' }
    | { kind: 'submitting' }
    | { kind: 'success'; leadId: string }
    | { kind: 'error'; message: string }
  >({ kind: 'idle' })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    const payload: CreateLeadRequest = {
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      phone: stringOrUndef(data.get('phone')),
      company: stringOrUndef(data.get('company')),
      message: stringOrUndef(data.get('message')),
      serviceInterest: stringOrUndef(data.get('serviceInterest')) ?? defaultServiceInterest,
      industry: stringOrUndef(data.get('industry')) ?? defaultIndustry,
      source,
      sourceUrl: typeof window !== 'undefined' ? window.location.href : undefined,
    }

    if (!payload.name || !payload.email) {
      setState({ kind: 'error', message: 'Name and email are required.' })
      return
    }

    setState({ kind: 'submitting' })
    try {
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text || `Submit failed (${res.status})`)
      }
      const json = (await res.json()) as { id: string }
      setState({ kind: 'success', leadId: json.id })
      form.reset()
    } catch (err) {
      setState({
        kind: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'Something went wrong. Call 888-503-0666 and we will help directly.',
      })
    }
  }

  if (state.kind === 'success') {
    return (
      <div className="relative bg-white rounded-[4px] border border-[#D5E0DE] p-10 text-center animate-fade-in overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#0F766E] via-[#CFFAFA] to-[#0F766E]" />
        <div className="w-12 h-12 rounded-[3px] bg-[#ECFEFE] border border-[#D5E0DE] mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-[#0F4C4C]" />
        </div>
        <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F4C4C]">
          Message received
        </p>
        <h3
          className="mt-2 font-serif text-2xl text-[#0F4C4C] tracking-[-0.01em]"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Thank you. A real engineer is on it.
        </h3>
        <p className="mt-3 text-[13.5px] text-[#5F6E6D] max-w-md mx-auto leading-relaxed">
          We&apos;ll respond within one business day. If it&apos;s urgent, call{' '}
          <span className="font-mono text-[#0F4C4C]">888-503-0666</span>.
        </p>
      </div>
    )
  }

  return (
    <div className="relative bg-white rounded-[4px] border border-[#D5E0DE] p-7 sm:p-9 overflow-hidden shadow-[0_24px_60px_-30px_rgba(8,47,47,0.18)]">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#0F766E] via-[#0F4C4C] to-[#0F766E]" />
      <div className="mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F4C4C]">
          Direct inquiry
        </p>
        <h3
          className="mt-2 font-serif text-[26px] text-[#0F4C4C] leading-tight tracking-[-0.01em]"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {heading}
        </h3>
        <p className="mt-2 text-[13.5px] text-[#5F6E6D]">{body}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className={compact ? '' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'}>
          <Field name="name" label="Full name" required autoComplete="name" />
          <Field
            name="email"
            label="Work email"
            type="email"
            required
            autoComplete="email"
          />
        </div>

        <div className={compact ? '' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'}>
          <Field name="company" label="Company" autoComplete="organization" />
          <Field name="phone" label="Phone" type="tel" autoComplete="tel" />
        </div>

        {(showServiceInterest || showIndustry) && (
          <div className={compact ? 'space-y-4' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'}>
            {showServiceInterest && (
              <Select
                name="serviceInterest"
                label="Service interest"
                defaultValue={defaultServiceInterest ?? ''}
                options={[
                  { value: '', label: 'Choose one' },
                  ...SERVICES.map((s) => ({ value: s.slug, label: s.name })),
                ]}
              />
            )}
            {showIndustry && (
              <Select
                name="industry"
                label="Industry"
                defaultValue={defaultIndustry ?? ''}
                options={[
                  { value: '', label: 'Choose one' },
                  ...INDUSTRIES.map((i) => ({ value: i.slug, label: i.name })),
                ]}
              />
            )}
          </div>
        )}

        <div>
          <label htmlFor="message" className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-2 block">
            What is on your mind?
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            placeholder="Tell us about your environment, your timeline, or a specific problem."
            className="input"
          />
        </div>

        {state.kind === 'error' && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{state.message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={state.kind === 'submitting'}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#0F4C4C] hover:bg-[#082F2F] text-white text-[13.5px] font-semibold px-4 py-3.5 rounded-[3px] transition-colors disabled:opacity-60 disabled:cursor-not-allowed border border-[#082F2F] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
        >
          {state.kind === 'submitting' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Sending…
            </>
          ) : (
            <>
              {submitLabel} <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-[10px] text-gray-400 leading-relaxed">
          By submitting you consent to GITSOLS contacting you about your inquiry. We do not share
          your information. Standard SMS/data rates may apply if you opt in to text updates.
        </p>
      </form>
    </div>
  )
}

function stringOrUndef(v: FormDataEntryValue | null): string | undefined {
  if (v === null) return undefined
  const s = String(v).trim()
  return s.length > 0 ? s : undefined
}

interface FieldProps {
  name: string
  label: string
  type?: string
  required?: boolean
  autoComplete?: string
}

function Field({ name, label, type = 'text', required, autoComplete }: FieldProps) {
  return (
    <div>
      <label htmlFor={name} className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-2 block">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="input"
      />
    </div>
  )
}

interface SelectProps {
  name: string
  label: string
  defaultValue: string
  options: { value: string; label: string }[]
}

function Select({ name, label, defaultValue, options }: SelectProps) {
  return (
    <div>
      <label htmlFor={name} className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-2 block">
        {label}
      </label>
      <select id={name} name={name} defaultValue={defaultValue} className="input">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
