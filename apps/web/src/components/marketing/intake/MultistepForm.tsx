'use client'

// Generic multistep form shell — used by /free-it-audit/intake and (later)
// the bespoke + marketing scope flows.
//
// Each step renders inside a stable card chrome with editorial typography:
// monospace step rail, serif step heading, hairline brass rules, footer with
// back / next / submit.
//
// State management is intentionally local — no global store. The form holds
// a single `answers` object the steps read from and write to.

import { useCallback, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'

export interface StepDefinition<TAnswers> {
  id: string
  title: string
  /** Editorial sub-heading shown under the title. */
  subtitle?: string
  /**
   * Render the step body. Receives current answers + an `update` patcher.
   * Returns React; the step is responsible for its own field layout.
   */
  render: (props: {
    answers: TAnswers
    update: (patch: Partial<TAnswers>) => void
  }) => React.ReactNode
  /**
   * Return null when the step is valid, or an error message string when
   * it isn't. Called on Next click.
   */
  validate?: (answers: TAnswers) => string | null
}

interface MultistepFormProps<TAnswers> {
  steps: StepDefinition<TAnswers>[]
  initial: TAnswers
  onSubmit: (answers: TAnswers) => Promise<void>
  /** Editorial section number shown above the eyebrow. */
  documentLabel?: string
  /** Eyebrow text — defaults to "Intake". */
  eyebrow?: string
  /** Final step submit button label. */
  submitLabel?: string
}

export default function MultistepForm<TAnswers>({
  steps,
  initial,
  onSubmit,
  documentLabel = 'IT Audit · Discovery',
  eyebrow = 'Intake',
  submitLabel = 'Request the audit',
}: MultistepFormProps<TAnswers>) {
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<TAnswers>(initial)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const step = steps[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === steps.length - 1
  const progressPct = Math.round(((stepIndex + 1) / steps.length) * 100)

  const update = useCallback((patch: Partial<TAnswers>) => {
    setAnswers((prev) => ({ ...prev, ...patch }))
    setError(null)
  }, [])

  const next = useCallback(() => {
    if (!step) return
    const err = step.validate?.(answers) ?? null
    if (err) {
      setError(err)
      return
    }
    setError(null)
    if (!isLast) setStepIndex((i) => Math.min(i + 1, steps.length - 1))
  }, [step, answers, isLast, steps.length])

  const back = useCallback(() => {
    setError(null)
    setStepIndex((i) => Math.max(i - 1, 0))
  }, [])

  const submit = useCallback(async () => {
    if (!step) return
    const err = step.validate?.(answers) ?? null
    if (err) {
      setError(err)
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit(answers)
    } catch (e) {
      setSubmitting(false)
      setError(
        e instanceof Error
          ? e.message
          : 'Something went wrong. Try again, or call 888-503-0666.',
      )
    }
  }, [step, answers, onSubmit])

  const stepRail = useMemo(
    () =>
      steps.map((s, i) => ({
        label: s.title,
        index: i,
        active: i === stepIndex,
        completed: i < stepIndex,
      })),
    [steps, stepIndex],
  )

  return (
    <div className="bg-white border border-[#D5E0DE] rounded-[4px] overflow-hidden shadow-[0_30px_60px_-30px_rgba(8,47,47,0.15)]">
      {/* Brass top rule */}
      <div className="h-[2px] bg-gradient-to-r from-[#0F766E] via-[#CFFAFA] to-[#0F766E]" />

      {/* Document header */}
      <div className="px-8 sm:px-10 pt-9 pb-6 border-b border-[#E5EDEB] bg-[#F4F8F7]">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F4C4C]">
            {documentLabel}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#5F6E6D]">
            {eyebrow} · Step {stepIndex + 1} of {steps.length} · {progressPct}%
          </span>
        </div>

        {/* Step rail */}
        <ol className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {stepRail.map((s) => (
            <li key={s.index} className="flex flex-col gap-1.5">
              <span
                className={`h-[3px] rounded-full transition-colors ${
                  s.completed
                    ? 'bg-[#0F4C4C]'
                    : s.active
                      ? 'bg-[#0F766E]'
                      : 'bg-[#D5E0DE]'
                }`}
              />
              <span
                className={`font-mono text-[10px] uppercase tracking-[0.18em] ${
                  s.active
                    ? 'text-[#0F4C4C]'
                    : s.completed
                      ? 'text-[#5F6E6D]'
                      : 'text-[#5F6E6D]/60'
                }`}
              >
                {String(s.index + 1).padStart(2, '0')} · {s.label}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Step body */}
      <div className="px-8 sm:px-10 pt-9 pb-6">
        {step && (
          <>
            <div>
              <h2
                className="font-serif text-[28px] sm:text-[32px] leading-[1.12] tracking-[-0.012em] text-[#0F4C4C]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {step.title}
              </h2>
              {step.subtitle && (
                <p
                  className="mt-2 font-serif italic text-[15px] text-[#5F6E6D]"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {step.subtitle}
                </p>
              )}
            </div>

            <div className="mt-8 animate-fade-in">{step.render({ answers, update })}</div>

            {error && (
              <div className="mt-6 px-4 py-3 border-l-2 border-red-500 bg-red-50 text-[12.5px] text-red-700 rounded-[3px]">
                {error}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer controls */}
      <div className="px-8 sm:px-10 py-6 border-t border-[#E5EDEB] bg-[#F4F8F7] flex items-center justify-between gap-3 flex-wrap">
        <button
          type="button"
          onClick={back}
          disabled={isFirst || submitting}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#0F4C4C] hover:text-[#082F2F] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>

        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#5F6E6D]/70 hidden sm:block">
          Your answers stay private until you submit
        </div>

        {isLast ? (
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-[#0F4C4C] hover:bg-[#082F2F] text-white text-[13px] font-semibold pl-5 pr-4 py-3 rounded-[3px] transition-colors disabled:opacity-60 disabled:cursor-not-allowed border border-[#082F2F] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Submitting…
              </>
            ) : (
              <>
                {submitLabel}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={next}
            className="inline-flex items-center gap-2 bg-[#0F4C4C] hover:bg-[#082F2F] text-white text-[13px] font-semibold pl-5 pr-4 py-3 rounded-[3px] transition-colors border border-[#082F2F] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
