'use client'

// The /free-it-audit/intake page hosts the 4-step audit intake form.
// Submits to /api/v1/prospects; on success redirects to /preview/<token>.

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  Users,
  MapPin,
  Briefcase,
  Key,
  Monitor,
  Database,
  HardDrive,
  History,
  ShieldCheck,
  Compass,
  Target,
  User,
  IdCard,
  Mail,
  Phone,
  CalendarClock,
  MessageSquare,
} from 'lucide-react'
import {
  INDUSTRIES,
  IDENTITY_PLATFORMS,
  RESTORE_DRILL_OPTIONS,
  INTAKE_PROMPTS,
  INTAKE_PRIORITIES,
  COMPANY,
} from '@gitsols/constants'
import type {
  IntakeAnswers,
  CreateProspectRequest,
  CreateProspectResponse,
} from '@gitsols/types'
import { env } from '@/env'
import MultistepForm, {
  type StepDefinition,
} from '@/components/marketing/intake/MultistepForm'
import {
  TextField,
  NumberField,
  TextArea,
  ChipSelect,
  ChipMultiSelect,
  PriorityRanker,
  PercentSlider,
  TimeWindowPicker,
  type TimeWindowOption,
} from '@/components/marketing/intake/IntakeInputs'

const INTAKE_VERSION = 'free_audit:v1'

const INITIAL: IntakeAnswers = {
  companyName: '',
  name: '',
  email: '',
}

// Generate 6 candidate windows over the next ~2 weeks of business days
// (rough — refined admin-side in Phase 2 with real calendar availability).
// Weekend filter uses the New-York timezone weekday so dates render and gate
// consistently regardless of the visitor's locale.
function buildTimeWindows(now: Date = new Date()): TimeWindowOption[] {
  const out: TimeWindowOption[] = []
  const dateFmt = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'America/New_York',
  })
  const dowFmt = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    timeZone: 'America/New_York',
  })
  const slots = [10, 14] // 10am ET, 2pm ET
  for (let dayOffset = 1, picked = 0; picked < 6 && dayOffset < 21; dayOffset++) {
    const d = new Date(now)
    d.setDate(d.getDate() + dayOffset)
    const nyDow = dowFmt.format(d)
    if (nyDow === 'Sat' || nyDow === 'Sun') continue
    for (const hour of slots) {
      const local = new Date(d)
      local.setHours(hour, 0, 0, 0)
      const labelTime = hour === 10 ? '10–11am ET' : '2–3pm ET'
      out.push({ iso: local.toISOString(), label: `${dateFmt.format(d)} · ${labelTime}` })
      picked++
      if (picked >= 6) break
    }
  }
  return out
}

export default function AuditIntakePage() {
  const router = useRouter()
  const windows = useMemo(() => buildTimeWindows(), [])

  const industryOptions = useMemo(
    () =>
      INDUSTRIES.map((i) => ({
        value: i.slug,
        label: i.shortName ?? i.name,
        helper: i.tagline,
      })),
    [],
  )

  const steps: StepDefinition<IntakeAnswers>[] = [
    {
      id: 'company',
      title: 'The company',
      subtitle: 'Tell us who we are talking with. We will tailor everything else from here.',
      render: ({ answers, update }) => (
        <div className="space-y-6">
          <TextField
            label="Company name"
            required
            icon={Building2}
            value={answers.companyName}
            onChange={(v) => update({ companyName: v })}
            autoComplete="organization"
            placeholder="e.g. Riverside Medical Group"
          />
          <ChipSelect
            label="Industry vertical"
            icon={Briefcase}
            value={answers.industry as (typeof industryOptions)[number]['value'] | undefined}
            onChange={(v) => update({ industry: v })}
            options={industryOptions}
            helper="If you operate in multiple, pick the regulator that bites hardest."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <NumberField
              label="Employees"
              icon={Users}
              value={answers.employeeCount}
              onChange={(v) => update({ employeeCount: v })}
              min={1}
              placeholder="50"
              unit="people"
            />
            <NumberField
              label="Office locations"
              icon={MapPin}
              value={answers.officeCount}
              onChange={(v) => update({ officeCount: v })}
              min={1}
              placeholder="3"
              unit="sites"
            />
          </div>
        </div>
      ),
      validate: (a) =>
        a.companyName.trim().length === 0 ? 'Tell us your company name to continue.' : null,
    },
    {
      id: 'environment',
      title: 'The environment today',
      subtitle:
        'Rough numbers are fine. We use these to scope what we actually need to look at on the audit call.',
      render: ({ answers, update }) => (
        <div className="space-y-7">
          <ChipSelect
            label="Identity platform"
            icon={Key}
            value={answers.identityPlatform}
            onChange={(v) => update({ identityPlatform: v })}
            options={IDENTITY_PLATFORMS}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <NumberField
              label="Endpoints (laptops + desktops)"
              icon={Monitor}
              value={answers.endpointCount}
              onChange={(v) => update({ endpointCount: v })}
              min={0}
              placeholder="120"
              unit="devices"
            />
            <TextField
              label="LOB / EHR / PMS app"
              icon={Database}
              value={answers.lobApp}
              onChange={(v) => update({ lobApp: v })}
              placeholder="Epic, NetSuite, Clio…"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <TextField
              label="Backup vendor"
              icon={HardDrive}
              value={answers.backupVendor}
              onChange={(v) => update({ backupVendor: v })}
              placeholder="Veeam, Datto, none, unsure"
            />
            <ChipSelect
              label="Last restore drill"
              icon={History}
              value={answers.lastRestoreDrill}
              onChange={(v) => update({ lastRestoreDrill: v })}
              options={RESTORE_DRILL_OPTIONS}
            />
          </div>
          <PercentSlider
            label="MFA coverage on user accounts (estimate)"
            icon={ShieldCheck}
            value={answers.mfaCoveragePercent}
            onChange={(v) => update({ mfaCoveragePercent: v })}
            helper="A best guess is fine — we'll verify on the call."
          />
        </div>
      ),
    },
    {
      id: 'priorities',
      title: 'What is prompting this',
      subtitle:
        'We will spend more time on what matters most to you. Pick what is true; rank what is urgent.',
      render: ({ answers, update }) => (
        <div className="space-y-7">
          <ChipMultiSelect
            label="What is prompting this audit?"
            icon={Compass}
            values={answers.prompts ?? []}
            onChange={(v) => update({ prompts: v })}
            options={INTAKE_PROMPTS}
            helper="Multiple is fine."
          />
          <PriorityRanker
            label="Top 3 priorities, in order"
            icon={Target}
            values={answers.topPriorities ?? []}
            onChange={(v) => update({ topPriorities: v })}
            options={INTAKE_PRIORITIES}
            max={3}
          />
        </div>
      ),
      validate: (a) =>
        (a.topPriorities ?? []).length === 0 ? 'Pick at least one priority to continue.' : null,
    },
    {
      id: 'you',
      title: 'You & the time',
      subtitle: 'How to reach you, and three windows we should try to fit.',
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
              placeholder="CEO · Practice Manager · IT Lead"
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
          <TimeWindowPicker
            label="Preferred audit windows"
            icon={CalendarClock}
            values={answers.preferredWindows ?? []}
            onChange={(v) => update({ preferredWindows: v })}
            options={windows}
            max={3}
          />
          <TextArea
            label="Anything specific you want covered?"
            icon={MessageSquare}
            value={answers.notesForCall}
            onChange={(v) => update({ notesForCall: v })}
            placeholder="A specific worry, a pending audit, a recent incident…"
            rows={3}
          />
        </div>
      ),
      validate: (a) => {
        if (a.name.trim().length === 0) return 'We need your name to schedule.'
        if (a.email.trim().length === 0) return 'We need your work email to reach you.'
        if ((a.preferredWindows ?? []).length === 0)
          return 'Pick at least one window so we can confirm a time.'
        return null
      },
    },
  ]

  async function handleSubmit(answers: IntakeAnswers) {
    const payload: CreateProspectRequest = {
      flow: 'free_audit',
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
          href="/free-it-audit"
          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[#5F6E6D] hover:text-[#0F4C4C] mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to overview
        </Link>

        <div className="mb-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F4C4C]">
            GITSOLS · Free IT audit
          </p>
          <h1
            className="mt-3 font-serif text-4xl sm:text-5xl leading-[1.04] tracking-[-0.018em] text-[#0F4C4C]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Step 1 of your engagement.
          </h1>
          <p className="mt-4 font-serif italic text-[17px] text-[#5F6E6D] leading-relaxed max-w-xl" style={{ fontFamily: 'var(--font-serif)' }}>
            Four short steps. Every answer becomes one less question on the call —
            and seeds the preview portal you&apos;ll see when you finish.
          </p>
        </div>

        <MultistepForm<IntakeAnswers>
          steps={steps}
          initial={INITIAL}
          onSubmit={handleSubmit}
          documentLabel="IT Audit · Discovery"
          submitLabel="Submit & open preview"
        />

        <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D]/70 text-center">
          Trouble with the form? Call {COMPANY.phone}
        </p>
      </div>
    </section>
  )
}
