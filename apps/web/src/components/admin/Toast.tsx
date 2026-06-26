'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

type ToastKind = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  kind: ToastKind
  title: string
  body?: string
}

interface ToastContextValue {
  push: (kind: ToastKind, title: string, body?: string) => void
}

const ToastCtx = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const push = useCallback((kind: ToastKind, title: string, body?: string) => {
    const id = Math.random().toString(36).slice(2)
    setItems((prev) => [...prev, { id, kind, title, body }])
  }, [])

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {items.map((t) => (
          <Toast key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

function Toast({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4500)
    return () => clearTimeout(timer)
  }, [onDismiss])

  const Icon = item.kind === 'success' ? CheckCircle2 : item.kind === 'error' ? AlertCircle : Info
  const tones: Record<ToastKind, { bar: string; icon: string; bg: string }> = {
    success: { bar: 'bg-[#0F766E]', icon: 'text-[#0F766E]', bg: 'bg-white' },
    error: { bar: 'bg-[#B53A2B]', icon: 'text-[#B53A2B]', bg: 'bg-white' },
    info: { bar: 'bg-[#0F4C4C]', icon: 'text-[#0F4C4C]', bg: 'bg-white' },
  }
  const tone = tones[item.kind]

  return (
    <div
      role="status"
      className={`pointer-events-auto relative w-[320px] ${tone.bg} border border-[#D5E0DE] rounded-[4px] shadow-[0_18px_36px_-12px_rgba(8,47,47,0.30)] overflow-hidden animate-slide-in-right`}
    >
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${tone.bar}`} />
      <div className="flex items-start gap-3 p-4 pr-2">
        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${tone.icon}`} />
        <div className="flex-1 min-w-0">
          <p
            className="font-serif text-[15px] text-[#0F4C4C] leading-tight tracking-[-0.005em]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {item.title}
          </p>
          {item.body && <p className="text-[12.5px] text-[#5F6E6D] mt-1 leading-snug">{item.body}</p>}
        </div>
        <button
          onClick={onDismiss}
          className="w-6 h-6 rounded text-[#5F6E6D] hover:text-[#0F4C4C] hover:bg-[#F4F8F7] flex items-center justify-center flex-shrink-0 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
