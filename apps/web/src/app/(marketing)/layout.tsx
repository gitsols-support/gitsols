import MarketingHeader from '@/components/marketing/MarketingHeader'
import MarketingFooter from '@/components/marketing/MarketingFooter'

/**
 * Layout for the (marketing) route group — wraps every public marketing page
 * in the shared header + footer. Sign-in (/admin) and admin shell pages live
 * outside this group and use their own layouts.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F8F7] text-[#062524] antialiased">
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  )
}
