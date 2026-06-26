'use client'

// Editorial-style intake inputs. Used inside MultistepForm step renderers.
//
// Every input uses the same chrome:
//   • Optional leading icon — vertical-centered with the eyebrow label text
//   • Monospace eyebrow label (text-[10px] uppercase tracking-[0.22em])
//   • Cool teal-tinted field background
//   • Brass focus accent on select/text
//   • Helper text below in 11.5px muted

import { useId } from 'react'
import type { LucideIcon } from 'lucide-react'

// ─── EyebrowLabel ───────────────────────────────────────────────────────

interface LabelProps {
  htmlFor: string
  children: React.ReactNode
  required?: boolean
  icon?: LucideIcon
}

function EyebrowLabel({ htmlFor, children, required, icon: Icon }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#5F6E6D] mb-2"
    >
      {Icon && (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-[3px] bg-[#ECFEFE] border border-[#D5E0DE] flex-shrink-0">
          <Icon className="w-3 h-3 text-[#0F4C4C]" />
        </span>
      )}
      <span className="leading-none">
        {children}
        {required && <span className="text-[#0F766E] ml-1">*</span>}
      </span>
    </label>
  )
}

// ─── TextField ─────────────────────────────────────────────────────────

interface TextFieldProps {
  label: string
  value: string | undefined
  onChange: (v: string) => void
  type?: 'text' | 'email' | 'tel' | 'url'
  placeholder?: string
  required?: boolean
  autoComplete?: string
  helper?: string
  icon?: LucideIcon
}

export function TextField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  autoComplete,
  helper,
  icon,
}: TextFieldProps) {
  const id = useId()
  return (
    <div>
      <EyebrowLabel htmlFor={id} required={required} icon={icon}>
        {label}
      </EyebrowLabel>
      <input
        id={id}
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className="w-full bg-[#F4F8F7] border border-[#D5E0DE] rounded-[3px] px-4 py-3 text-[14.5px] text-[#0F4C4C] placeholder:text-[#5F6E6D]/50 outline-none transition-colors focus:border-[#0F766E] focus:bg-white"
      />
      {helper && <p className="mt-1.5 text-[11.5px] text-[#5F6E6D]">{helper}</p>}
    </div>
  )
}

// ─── NumberField ───────────────────────────────────────────────────────

interface NumberFieldProps {
  label: string
  value: number | undefined
  onChange: (v: number | undefined) => void
  min?: number
  max?: number
  placeholder?: string
  required?: boolean
  helper?: string
  unit?: string
  icon?: LucideIcon
}

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  placeholder,
  required,
  helper,
  unit,
  icon,
}: NumberFieldProps) {
  const id = useId()
  return (
    <div>
      <EyebrowLabel htmlFor={id} required={required} icon={icon}>
        {label}
      </EyebrowLabel>
      <div className="relative">
        <input
          id={id}
          type="number"
          value={value ?? ''}
          onChange={(e) => {
            const raw = e.target.value
            if (raw === '') return onChange(undefined)
            const n = Number(raw)
            onChange(Number.isFinite(n) ? n : undefined)
          }}
          min={min}
          max={max}
          placeholder={placeholder}
          required={required}
          className={`w-full bg-[#F4F8F7] border border-[#D5E0DE] rounded-[3px] px-4 py-3 text-[14.5px] text-[#0F4C4C] placeholder:text-[#5F6E6D]/50 outline-none transition-colors focus:border-[#0F766E] focus:bg-white ${unit ? 'pr-14' : ''}`}
        />
        {unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#5F6E6D]">
            {unit}
          </span>
        )}
      </div>
      {helper && <p className="mt-1.5 text-[11.5px] text-[#5F6E6D]">{helper}</p>}
    </div>
  )
}

// ─── TextArea ──────────────────────────────────────────────────────────

interface TextAreaProps {
  label: string
  value: string | undefined
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  helper?: string
  icon?: LucideIcon
}

export function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  helper,
  icon,
}: TextAreaProps) {
  const id = useId()
  return (
    <div>
      <EyebrowLabel htmlFor={id} icon={icon}>
        {label}
      </EyebrowLabel>
      <textarea
        id={id}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-[#F4F8F7] border border-[#D5E0DE] rounded-[3px] px-4 py-3 text-[14.5px] text-[#0F4C4C] placeholder:text-[#5F6E6D]/50 outline-none transition-colors focus:border-[#0F766E] focus:bg-white resize-none"
      />
      {helper && <p className="mt-1.5 text-[11.5px] text-[#5F6E6D]">{helper}</p>}
    </div>
  )
}

// ─── ChipSelect (single) ───────────────────────────────────────────────

interface ChipSelectProps<T extends string> {
  label: string
  value: T | undefined
  onChange: (v: T) => void
  options: readonly { value: T; label: string; helper?: string }[]
  required?: boolean
  helper?: string
  icon?: LucideIcon
}

export function ChipSelect<T extends string>({
  label,
  value,
  onChange,
  options,
  required,
  helper,
  icon,
}: ChipSelectProps<T>) {
  const id = useId()
  return (
    <div>
      <EyebrowLabel htmlFor={id} required={required} icon={icon}>
        {label}
      </EyebrowLabel>
      <div id={id} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {options.map((o) => {
          const active = value === o.value
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className={`text-left px-4 py-3 rounded-[3px] border transition-all ${
                active
                  ? 'bg-[#0F4C4C] border-[#082F2F] text-white'
                  : 'bg-[#F4F8F7] border-[#D5E0DE] text-[#0F4C4C] hover:border-[#0F766E] hover:bg-white'
              }`}
            >
              <span className="block text-[13.5px] font-semibold">{o.label}</span>
              {o.helper && (
                <span
                  className={`block text-[11.5px] mt-0.5 ${active ? 'text-white/65' : 'text-[#5F6E6D]'}`}
                >
                  {o.helper}
                </span>
              )}
            </button>
          )
        })}
      </div>
      {helper && <p className="mt-2 text-[11.5px] text-[#5F6E6D]">{helper}</p>}
    </div>
  )
}

// ─── ChipMultiSelect ───────────────────────────────────────────────────

interface ChipMultiSelectProps {
  label: string
  values: string[]
  onChange: (v: string[]) => void
  options: readonly { value: string; label: string }[]
  max?: number
  helper?: string
  icon?: LucideIcon
}

export function ChipMultiSelect({
  label,
  values,
  onChange,
  options,
  max,
  helper,
  icon,
}: ChipMultiSelectProps) {
  const id = useId()
  function toggle(v: string) {
    if (values.includes(v)) {
      onChange(values.filter((x) => x !== v))
    } else if (!max || values.length < max) {
      onChange([...values, v])
    }
  }
  return (
    <div>
      <EyebrowLabel htmlFor={id} icon={icon}>
        {label}
      </EyebrowLabel>
      <div id={id} className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = values.includes(o.value)
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => toggle(o.value)}
              className={`inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-2 rounded-[3px] border transition-all ${
                active
                  ? 'bg-[#0F4C4C] border-[#082F2F] text-white'
                  : 'bg-[#F4F8F7] border-[#D5E0DE] text-[#0F4C4C] hover:border-[#0F766E]'
              }`}
            >
              {active && <span aria-hidden>✓</span>}
              {o.label}
            </button>
          )
        })}
      </div>
      {helper && <p className="mt-2 text-[11.5px] text-[#5F6E6D]">{helper}</p>}
    </div>
  )
}

// ─── PriorityRanker ────────────────────────────────────────────────────
// Click options in order to pick top N; each shows its rank.

interface PriorityRankerProps {
  label: string
  values: string[]
  onChange: (v: string[]) => void
  options: readonly { value: string; label: string }[]
  max?: number
  helper?: string
  icon?: LucideIcon
}

export function PriorityRanker({
  label,
  values,
  onChange,
  options,
  max = 3,
  helper = 'Click in order — your top pick first.',
  icon,
}: PriorityRankerProps) {
  function toggle(v: string) {
    if (values.includes(v)) {
      onChange(values.filter((x) => x !== v))
    } else if (values.length < max) {
      onChange([...values, v])
    }
  }
  return (
    <div>
      <div className="flex items-end justify-between gap-3 mb-2">
        <EyebrowLabel htmlFor="priorities" icon={icon}>
          {label}
        </EyebrowLabel>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D]/70">
          {values.length} / {max}
        </span>
      </div>
      <div id="priorities" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((o) => {
          const rank = values.indexOf(o.value) + 1
          const active = rank > 0
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => toggle(o.value)}
              className={`flex items-center gap-3 text-left px-4 py-3 rounded-[3px] border transition-all ${
                active
                  ? 'bg-[#0F4C4C] border-[#082F2F] text-white'
                  : 'bg-[#F4F8F7] border-[#D5E0DE] text-[#0F4C4C] hover:border-[#0F766E] hover:bg-white'
              }`}
            >
              <span
                className={`flex-shrink-0 w-7 h-7 rounded-[3px] flex items-center justify-center font-mono text-[12px] font-semibold ${
                  active
                    ? 'bg-[#0F766E] text-[#082F2F]'
                    : 'bg-white border border-[#D5E0DE] text-[#5F6E6D]'
                }`}
              >
                {active ? rank : '—'}
              </span>
              <span className="text-[13.5px] font-medium">{o.label}</span>
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-[11.5px] text-[#5F6E6D]">{helper}</p>
    </div>
  )
}

// ─── PercentSlider ────────────────────────────────────────────────────

interface PercentSliderProps {
  label: string
  value: number | undefined
  onChange: (v: number) => void
  helper?: string
  icon?: LucideIcon
}

export function PercentSlider({ label, value, onChange, helper, icon }: PercentSliderProps) {
  const id = useId()
  const v = value ?? 0
  return (
    <div>
      <div className="flex items-end justify-between gap-3 mb-2">
        <EyebrowLabel htmlFor={id} icon={icon}>
          {label}
        </EyebrowLabel>
        <span className="font-mono text-[14px] font-semibold text-[#0F4C4C]">
          {v}
          <span className="font-mono text-[11px] text-[#5F6E6D] ml-0.5">%</span>
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={5}
        value={v}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#0F4C4C]"
      />
      <div className="flex justify-between mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D]/60">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
      {helper && <p className="mt-2 text-[11.5px] text-[#5F6E6D]">{helper}</p>}
    </div>
  )
}

// ─── TimeWindowPicker ─────────────────────────────────────────────────
// Three radio options for next-N-days morning/afternoon/evening windows.

export interface TimeWindowOption {
  /** ISO datetime of the start of the window. */
  iso: string
  /** Display label e.g. "Tue, Jun 4 · 2-3pm ET" */
  label: string
}

interface TimeWindowPickerProps {
  label: string
  values: string[]
  onChange: (v: string[]) => void
  options: readonly TimeWindowOption[]
  max?: number
  helper?: string
  icon?: LucideIcon
}

export function TimeWindowPicker({
  label,
  values,
  onChange,
  options,
  max = 3,
  helper = 'Pick up to 3 windows that work for you. We will confirm one.',
  icon,
}: TimeWindowPickerProps) {
  function toggle(iso: string) {
    if (values.includes(iso)) {
      onChange(values.filter((x) => x !== iso))
    } else if (values.length < max) {
      onChange([...values, iso])
    }
  }
  return (
    <div>
      <div className="flex items-end justify-between gap-3 mb-2">
        <EyebrowLabel htmlFor="windows" icon={icon}>
          {label}
        </EyebrowLabel>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D]/70">
          {values.length} / {max}
        </span>
      </div>
      <div id="windows" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((o) => {
          const active = values.includes(o.iso)
          return (
            <button
              key={o.iso}
              type="button"
              onClick={() => toggle(o.iso)}
              className={`flex items-center justify-between text-left px-4 py-3 rounded-[3px] border transition-all ${
                active
                  ? 'bg-[#0F4C4C] border-[#082F2F] text-white'
                  : 'bg-[#F4F8F7] border-[#D5E0DE] text-[#0F4C4C] hover:border-[#0F766E] hover:bg-white'
              }`}
            >
              <span className="text-[13px] font-medium">{o.label}</span>
              <span
                className={`font-mono text-[10px] uppercase tracking-[0.18em] ${
                  active ? 'text-[#0F766E]' : 'text-[#5F6E6D]/70'
                }`}
              >
                {active ? 'Selected' : 'Open'}
              </span>
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-[11.5px] text-[#5F6E6D]">{helper}</p>
    </div>
  )
}
