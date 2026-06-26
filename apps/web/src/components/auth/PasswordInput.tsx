'use client'

import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { IconInput } from '@/components/ui/IconInput'

interface PasswordInputProps {
  id?: string
  value: string
  onChange: (next: string) => void
  placeholder?: string
  autoComplete?: string
}

export default function PasswordInput({
  id,
  value,
  onChange,
  placeholder = '••••••••••••••',
  autoComplete = 'current-password',
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  return (
    <IconInput
      icon={Lock}
      id={id}
      type={visible ? 'text' : 'password'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-[#0F4C4C] hover:bg-gray-50 transition-colors"
        >
          {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      }
    />
  )
}
