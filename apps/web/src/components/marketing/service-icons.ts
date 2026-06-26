// Slug → lucide icon mapping for the 8 services.
//
// Kept here (in apps/web) rather than @gitsols/constants because the
// constants package is pure data — no React, no lucide. The mapping is a
// presentational concern that belongs with the components that render it.
//
// Add a new service in @gitsols/constants and you'll see a fallback Cog icon
// here until you add the matching entry below.

import {
  Server,
  ShieldCheck,
  ScrollText,
  Cloud,
  PhoneCall,
  MessagesSquare,
  Network,
  Sparkles,
  Cog,
  type LucideIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  'managed-it': Server,
  cybersecurity: ShieldCheck,
  compliance: ScrollText,
  cloud: Cloud,
  'business-phone': PhoneCall,
  communications: MessagesSquare,
  network: Network,
  'bespoke-software': Sparkles,
}

export function getServiceIcon(slug: string): LucideIcon {
  return ICONS[slug] ?? Cog
}
