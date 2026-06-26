'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  body?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
      if (e.key === 'Enter') onConfirm()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel, onConfirm])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-[90] flex items-center justify-center p-6 bg-[#062524]/40 backdrop-blur-[2px] animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="relative bg-white border border-[#D5E0DE] rounded-[4px] shadow-[0_30px_60px_-20px_rgba(8,47,47,0.40)] max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`absolute top-0 left-0 right-0 h-[2px] ${destructive ? 'bg-[#B53A2B]' : 'bg-[#0F766E]'}`}
        />
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div
              className={`w-10 h-10 rounded-[3px] flex items-center justify-center flex-shrink-0 ${
                destructive ? 'bg-[#FBE6E1] border border-[#F5C9C0]' : 'bg-[#ECFEFE] border border-[#CFFAFA]'
              }`}
            >
              <AlertTriangle
                className={`w-4 h-4 ${destructive ? 'text-[#B53A2B]' : 'text-[#0F4C4C]'}`}
              />
            </div>
            <div>
              <h3
                id="confirm-title"
                className="font-serif text-[22px] text-[#0F4C4C] leading-tight tracking-[-0.01em]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {title}
              </h3>
              {body && <div className="mt-2 text-[13.5px] text-[#5F6E6D] leading-relaxed">{body}</div>}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5EDEB]">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center text-[12.5px] font-semibold text-[#0F4C4C] border border-[#D5E0DE] bg-white hover:border-[#0F4C4C]/40 px-4 py-2 rounded-[3px] transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`inline-flex items-center text-[12.5px] font-semibold text-white px-4 py-2 rounded-[3px] transition-colors border ${
                destructive
                  ? 'bg-[#B53A2B] hover:bg-[#902C1F] border-[#902C1F]'
                  : 'bg-[#0F4C4C] hover:bg-[#082F2F] border-[#082F2F]'
              } shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
