'use client'

// /services/bespoke-software/scope — 4-step scope-a-project intake.
// Distinct from the IT audit form: focused on what we'd BUILD, not what
// we'd audit. Submits to /api/v1/prospects with flow=bespoke_scope.

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  Boxes,
  Lightbulb,
  AlignLeft,
  Users,
  UserCircle2,
  Layers,
  Plug,
  ShieldCheck,
  GitBranch,
  CalendarClock,
  Banknote,
  Target,
  Palette,
  Key,
  User,
  IdCard,
  Mail,
  Phone,
  Handshake,
  MessageSquare,
} from 'lucide-react'
import {
  PROJECT_KINDS,
  TARGET_USERS,
  USER_COUNT_BANDS,
  PLATFORMS,
  DATA_SENSITIVITY_LEVELS,
  PROJECT_STATES,
  LAUNCH_WINDOWS,
  BUDGET_BANDS,
  OWNERSHIP_OPTIONS,
  COMPANY,
} from '@gitsols/constants'
import type {
  BespokeScopeAnswers,
  CreateProspectRequest,
  CreateProspectResponse,
} from '@gitsols/types'
import { env } from '@/env'
import MultistepForm, {
  type StepDefinition,
} from '@/components/marketing/intake/MultistepForm'
import {
  TextField,
  TextArea,
  ChipSelect,
  ChipMultiSelect,
} from '@/components/marketing/intake/IntakeInputs'

const INTAKE_VERSION = 'bespoke_scope:v1'

const INITIAL: BespokeScopeAnswers = {
  companyName: '',
  projectVision: '',
  name: '',
  email: '',
}

export default function BespokeScopePage() {
  const router = useRouter()

  const platformOptions = useMemo(
    () => PLATFORMS.map((p) => ({ value: p.value, label: p.label })),
    [],
  )

  const steps: StepDefinition<BespokeScopeAnswers>[] = [
    {
      id: 'project',
      title: 'The project',
      subtitle:
        'Help us understand what you want to build — and the smallest possible description of why it matters.',
      render: ({ answers, update }) => (
        <div className="space-y-6">
          <TextField
            label="Company name"
            required
            icon={Building2}
            value={answers.companyName}
            onChange={(v) => update({ companyName: v })}
            autoComplete="organization"
            placeholder="e.g. Bayshore Health Group"
          />
          <ChipSelect
            label="What are you looking to build?"
            icon={Boxes}
            value={answers.projectKind}
            onChange={(v) => update({ projectKind: v })}
            options={PROJECT_KINDS}
            helper="Pick the closest fit — we can refine on the call."
          />
          <TextField
            label="One-line vision"
            required
            icon={Lightbulb}
            value={answers.projectVision}
            onChange={(v) => update({ projectVision: v })}
            placeholder='e.g. "A patient-intake portal that cuts our front-desk paperwork in half."'
          />
          <TextArea
            label="The problem you are solving (optional)"
            icon={AlignLeft}
            value={answers.problemStatement}
            onChange={(v) => update({ problemStatement: v })}
            placeholder="What hurts today? Who feels it? What have you already tried?"
            rows={4}
          />
        </div>
      ),
      validate: (a) => {
        if (a.companyName.trim().length === 0)
          return 'Tell us your company name to continue.'
        if (a.projectVision.trim().length === 0)
          return 'Give us a one-line vision so we know what we are scoping.'
        return null
      },
    },
    {
      id: 'shape',
      title: 'The shape',
      subtitle:
        'Who uses it, where it runs, what it touches. Rough answers are fine — we just need the silhouette.',
      render: ({ answers, update }) => (
        <div className="space-y-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ChipSelect
              label="Primary users"
              icon={Users}
              value={answers.targetUsers}
              onChange={(v) => update({ targetUsers: v })}
              options={TARGET_USERS}
            />
            <ChipSelect
              label="User count expected"
              icon={UserCircle2}
              value={answers.userCountBand}
              onChange={(v) => update({ userCountBand: v })}
              options={USER_COUNT_BANDS}
            />
          </div>
          <ChipMultiSelect
            label="Platforms"
            icon={Layers}
            values={answers.platforms ?? []}
            onChange={(v) => update({ platforms: v })}
            options={platformOptions}
            helper="Multiple is fine. iOS + Android typically ship from one React Native codebase."
          />
          <TextArea
            label="Must-have integrations"
            icon={Plug}
            value={answers.mustHaveIntegrations}
            onChange={(v) => update({ mustHaveIntegrations: v })}
            placeholder="e.g. Epic EHR, M365 / Entra, QuickBooks, Stripe, Salesforce, internal SQL"
            rows={3}
            helper="What does this need to talk to from day one?"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ChipSelect
              label="Data sensitivity"
              icon={ShieldCheck}
              value={answers.dataSensitivity}
              onChange={(v) => update({ dataSensitivity: v })}
              options={DATA_SENSITIVITY_LEVELS}
            />
            <ChipSelect
              label="Starting point"
              icon={GitBranch}
              value={answers.projectState}
              onChange={(v) => update({ projectState: v })}
              options={PROJECT_STATES}
            />
          </div>
        </div>
      ),
    },
    {
      id: 'constraints',
      title: 'The constraints',
      subtitle:
        'Timeline and budget — even rough — set the shape of the engagement. Ranges are perfect.',
      render: ({ answers, update }) => (
        <div className="space-y-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ChipSelect
              label="Target launch window"
              icon={CalendarClock}
              value={answers.launchWindow}
              onChange={(v) => update({ launchWindow: v })}
              options={LAUNCH_WINDOWS}
            />
            <ChipSelect
              label="Budget band"
              icon={Banknote}
              value={answers.budgetBand}
              onChange={(v) => update({ budgetBand: v })}
              options={BUDGET_BANDS}
            />
          </div>
          <TextArea
            label="What does success look like in 90 days?"
            icon={Target}
            value={answers.successMetric}
            onChange={(v) => update({ successMetric: v })}
            placeholder='e.g. "100 patients onboarded through the new portal", "front desk paperwork cut by 50%".'
            rows={3}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ChipSelect
              label="Codebase preference"
              icon={Key}
              value={answers.ownership}
              onChange={(v) => update({ ownership: v })}
              options={OWNERSHIP_OPTIONS}
            />
            <DesignAssetsToggle
              value={answers.hasDesignAssets}
              onChange={(v) => update({ hasDesignAssets: v })}
            />
          </div>
        </div>
      ),
    },
    {
      id: 'you',
      title: 'You',
      subtitle: 'How to reach you. We respond within one business day.',
      render: ({ answers, update }) => (
        <div className="space-y-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <TextField
              label="Your name"
              required
              icon={User}
              value={answers.name}
              onChange={(v) => update({ name: v })}
              autoComplete="name"
              placeholder="Jane Doe"
            />
            <TextField
              label="Your role"
              icon={IdCard}
              value={answers.role}
              onChange={(v) => update({ role: v })}
              placeholder="CEO · CTO · Founder · Product"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <TextField
              label="Work email"
              type="email"
              required
              icon={Mail}
              value={answers.email}
              onChange={(v) => update({ email: v })}
              autoComplete="email"
              placeholder="you@company.com"
            />
            <TextField
              label="Phone"
              type="tel"
              icon={Phone}
              value={answers.phone}
              onChange={(v) => update({ phone: v })}
              autoComplete="tel"
              placeholder="(555) 123-4567"
            />
          </div>
          <TextField
            label="How did you hear about us?"
            icon={Handshake}
            value={answers.referredBy}
            onChange={(v) => update({ referredBy: v })}
            placeholder="Referral, web search, LinkedIn, event…"
          />
          <TextArea
            label="Anything specific you want covered on the call?"
            icon={MessageSquare}
            value={answers.notesForCall}
            onChange={(v) => update({ notesForCall: v })}
            placeholder="Existing system to be migrated, regulatory constraints, a specific deadline…"
            rows={3}
          />
        </div>
      ),
      validate: (a) => {
        if (a.name.trim().length === 0) return 'We need your name to schedule.'
        if (a.email.trim().length === 0) return 'We need your work email to reach you.'
        return null
      },
    },
  ]

  async function handleSubmit(answers: BespokeScopeAnswers) {
    const payload: CreateProspectRequest = {
      flow: 'bespoke_scope',
      intakeVersion: INTAKE_VERSION,
      answers,
      sourceUrl: typeof window !== 'undefined' ? window.location.href : undefined,
    }
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/prospects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(text || `Submit failed (${res.status})`)
    }
    const json = (await res.json()) as CreateProspectResponse
    router.push(`/preview/${encodeURIComponent(json.previewToken)}`)
  }

  return (
    <section className="bg-[#F4F8F7]">
      <div className="max-w-3xl mx-auto px-6 py-14">
        <Link
          href="/services/bespoke-software"
          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[#5F6E6D] hover:text-[#0F4C4C] mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to bespoke software
        </Link>

        <div className="mb-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F766E]">
            GITSOLS · Bespoke software · Scope a project
          </p>
          <h1
            className="mt-3 font-serif text-4xl sm:text-5xl leading-[1.04] tracking-[-0.018em] text-[#0F4C4C]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Tell us what you want to build.
          </h1>
          <p
            className="mt-4 text-[15px] text-[#5F6E6D] leading-relaxed max-w-xl"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Four short steps. By the end we have enough to come back with a
            rough scope, timeline, and price band — not a $20k discovery sprint
            you have to fund first.
          </p>
        </div>

        <MultistepForm<BespokeScopeAnswers>
          steps={steps}
          initial={INITIAL}
          onSubmit={handleSubmit}
          documentLabel="Bespoke build · Scope intake"
          eyebrow="Scope"
          submitLabel="Submit project brief"
        />

        <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D]/70 text-center">
          Prefer a direct conversation? Call {COMPANY.phone}
        </p>
      </div>
    </section>
  )
}

// ─── Subcomponents ────────────────────────────────────────────────────

function DesignAssetsToggle({
  value,
  onChange,
}: {
  value: boolean | undefined
  onChange: (v: boolean) => void
}) {
  return (
    <div>
      <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#5F6E6D] mb-2">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-[3px] bg-[#ECFEFE] border border-[#D5E0DE] flex-shrink-0">
          <Palette className="w-3 h-3 text-[#0F4C4C]" />
        </span>
        <span className="leading-none">Existing design assets?</span>
      </label>
      <div className="grid grid-cols-2 gap-2">
        {[
          { v: true, label: 'Yes', helper: 'Figma / brand ready' },
          { v: false, label: 'No', helper: 'We design from zero' },
        ].map((o) => {
          const active = value === o.v
          return (
            <button
              key={String(o.v)}
              type="button"
              onClick={() => onChange(o.v)}
              className={`text-left px-4 py-3 rounded-[3px] border transition-all ${
                active
                  ? 'bg-[#0F4C4C] border-[#082F2F] text-white'
                  : 'bg-[#F4F8F7] border-[#D5E0DE] text-[#0F4C4C] hover:border-[#0F766E] hover:bg-white'
              }`}
            >
              <span className="block text-[13.5px] font-semibold">{o.label}</span>
              <span
                className={`block text-[11.5px] mt-0.5 ${active ? 'text-white/65' : 'text-[#5F6E6D]'}`}
              >
                {o.helper}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
