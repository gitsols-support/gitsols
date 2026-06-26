/**
 * "Continue with Microsoft" button — Microsoft branded per the
 * Microsoft Identity Platform branding guidelines:
 * https://learn.microsoft.com/en-us/entra/identity-platform/howto-add-branding-in-apps
 *
 * The four-quadrant logo is rendered inline as SVG so we don't depend on
 * an external image asset.
 */

interface MicrosoftButtonProps {
  onClick?: () => void
  loading?: boolean
  variant?: 'light' | 'dark'
  label?: string
}

export default function MicrosoftButton({
  onClick,
  loading = false,
  variant = 'light',
  label = 'Continue with Microsoft',
}: MicrosoftButtonProps) {
  const isDark = variant === 'dark'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={[
        'w-full inline-flex items-center justify-center gap-3 px-4 py-3 rounded-xl',
        'text-sm font-semibold transition-all',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        isDark
          ? 'bg-[#0F4C4C] text-white hover:bg-[#155E5E] active:bg-[#0A3A3A] border border-transparent'
          : 'bg-white text-[#1F1F1F] border-2 border-[#8C8C8C] hover:bg-[#F5F5F5] hover:border-[#0F4C4C] focus-visible:border-[#0F4C4C]',
      ].join(' ')}
      aria-label={label}
    >
      <svg width="20" height="20" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="1" y="1" width="9" height="9" fill="#F25022" />
        <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
        <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
        <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
      </svg>
      <span>{label}</span>
    </button>
  )
}
