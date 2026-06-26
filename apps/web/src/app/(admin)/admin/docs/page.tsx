import type { Metadata } from 'next'
import { BookOpen, Code2, Layers, Shield, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'

export const metadata: Metadata = { title: 'Docs · Admin' }

const SECTIONS = [
  {
    icon: Code2,
    title: 'Developer reference',
    description: 'Monorepo layout, data model (Drizzle), RLS policies, API surface, deploy targets.',
    link: 'See CLAUDE.md',
  },
  {
    icon: Layers,
    title: 'Implementor playbook',
    description: 'How a new client engagement actually moves through the system — kickoff to QBR.',
    link: 'Read playbook',
  },
  {
    icon: Shield,
    title: 'HIPAA posture',
    description: 'BAA-ready controls, encryption at rest/in-transit, audit log retention, breach playbook.',
    link: 'See policy pack',
  },
  {
    icon: BookOpen,
    title: 'Style guide',
    description: 'Voice & tone, brand vocabulary, what we call things on the public site.',
    link: 'Open guide',
  },
]

export default function AdminDocsPage() {
  return (
    <div className="max-w-[1200px] space-y-6">
      <AdminPageHeader
        eyebrow="Knowledge"
        title="Documentation"
        description="Internal documentation — developer reference, operational playbooks, compliance posture, and the brand style guide."
        breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Help' }, { label: 'Docs' }]}
        stats={[
          { label: 'Sections', value: SECTIONS.length },
          { label: 'Policies', value: 12 },
          { label: 'Runbooks', value: 28 },
          { label: 'Updated · 30d', value: 14 },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {SECTIONS.map((s) => {
          const Icon = s.icon
          return (
            <AdminCard key={s.title} eyebrow="Section" title={s.title} description={s.description}>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-[3px] bg-[#F4F8F7] border border-[#D5E0DE]">
                  <Icon className="w-4 h-4 text-[#0F4C4C]" />
                </span>
                <Link href="/admin/docs" className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#0F4C4C] hover:text-[#082F2F]">
                  {s.link}
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </AdminCard>
          )
        })}
      </div>

      <AdminCard eyebrow="Where to start" title="Repo layout">
        <pre className="font-mono text-[12px] text-[#0F4C4C] bg-[#F4F8F7] border border-[#D5E0DE] rounded-[3px] p-4 overflow-x-auto leading-relaxed">
{`gitsols-platform/
├── apps/
│   ├── web/        ─ Next.js 16 marketing + admin + portal
│   └── api/        ─ NestJS 11 on Fastify
└── packages/
    ├── types/      ─ @gitsols/types
    ├── constants/  ─ @gitsols/constants (services, industries, process)
    └── utils/      ─ @gitsols/utils

apps/web/src/
├── app/
│   ├── (marketing)/  marketing pages
│   ├── (admin)/      admin shell (protected by middleware)
│   └── admin/        sign-in page (public)
├── components/
│   ├── marketing/    public-page components
│   ├── admin/        admin-only components
│   ├── layout/       admin shell chrome
│   └── ui/           primitives
└── server/
    └── admin-stubs.ts  Phase 1 stub data — swap for live API`}
        </pre>
      </AdminCard>
    </div>
  )
}
