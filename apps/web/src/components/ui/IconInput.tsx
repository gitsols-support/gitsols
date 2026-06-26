'use client'

import { forwardRef } from 'react'
import { cn } from '@gitsols/utils'

/**
 * IconInput — flex-based input with a leading icon.
 *
 * The icon and the field are siblings inside a flex row that shares the
 * same border, so they always center together regardless of font metrics.
 * Do NOT use absolute-positioned icons with `pl-10` on a padded input —
 * that pattern drifts vertically across browsers and font sizes.
 *
 * Use this instead of the bare `.input` class whenever an icon is needed.
 */
export interface IconInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  icon: React.ElementType
  /** Optional trailing slot — buttons (toggle visibility, clear, etc.) render here. */
  trailing?: React.ReactNode
  size?: 'sm' | 'md'
  wrapperClassName?: string
}

export const IconInput = forwardRef<HTMLInputElement, IconInputProps>(function IconInput(
  { icon: Icon, trailing, size = 'md', wrapperClassName, className, ...inputProps },
  ref,
) {
  const sizeClass = size === 'sm'
    ? { wrap: 'h-9 px-2.5 gap-2', icon: 'w-3.5 h-3.5', input: 'text-xs' }
    : { wrap: 'h-11 px-3.5 gap-2.5', icon: 'w-4 h-4', input: 'text-sm' }

  return (
    <div
      className={cn(
        'flex items-center bg-white border border-[#E2E8E8] rounded-lg',
        'focus-within:border-[#0F4C4C] focus-within:ring-2 focus-within:ring-[#0F4C4C]/15',
        'transition-shadow',
        sizeClass.wrap,
        wrapperClassName,
      )}
    >
      <Icon className={cn('text-gray-400 flex-shrink-0', sizeClass.icon)} aria-hidden="true" />
      <input
        ref={ref}
        {...inputProps}
        className={cn(
          'flex-1 min-w-0 bg-transparent border-0 outline-none placeholder:text-gray-400 text-[#042F2E]',
          sizeClass.input,
          className,
        )}
      />
      {trailing && <div className="flex-shrink-0 -mr-1 flex items-center">{trailing}</div>}
    </div>
  )
})
