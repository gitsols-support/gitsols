import { Construction } from 'lucide-react'

interface PlaceholderPageProps {
  title: string
  description: string
  eyebrow?: string
}

export default function PlaceholderPage({
  title,
  description,
  eyebrow = 'Boilerplate',
}: PlaceholderPageProps) {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#14B8A6]/80 mb-1">
          {eyebrow}
        </p>
        <h1 className="text-xl font-bold text-[#0F4C4C]">{title}</h1>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>

      <div className="bg-white rounded-2xl border border-dashed border-[#E2E8E8] p-10 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#F0FDFA] border border-[#14B8A6]/25 flex items-center justify-center mx-auto mb-4">
          <Construction className="w-5 h-5 text-[#14B8A6]" />
        </div>
        <p className="text-sm font-semibold text-[#0F4C4C] mb-1">Build this page</p>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          This is a stub from <code className="font-mono">PlaceholderPage</code>. Replace the
          contents of this route with your real page. The layout shell (sidebar, top bar, right
          sidebar) is already wired around it.
        </p>
      </div>
    </div>
  )
}
