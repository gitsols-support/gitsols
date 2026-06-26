// ─── GITSOLS marketing-site constants ──────────────────────────────────────
//
// Single source of truth for the public site. Pages render off these arrays
// so:
//   - adding a service = one entry here, all pages update
//   - the sitemap is generated from the same data
//   - the lead form's "service interest" dropdown matches what's actually
//     in the catalog
//
// Tone rules for the copy in this file:
//   - Plain language, technically precise, no hype.
//   - Concrete deliverables and outcomes, not "transform" or "innovate".
//   - Healthcare/financial buyers read these — compliance language has to
//     be specific (HIPAA, SOC 2, NIST, NYDFS), not generic.

export const COMPANY = {
  legalName: 'GITSOLS LLC',
  brand: 'GITSOLS',
  longName: 'Guardian IT Solutions & Services',
  founder: 'Sohail Akram',
  yearsExperience: '25+',
  phone: '888-503-0666',
  phoneE164: '+18885030666',
  email: 'info@gitsols.com',
  address: {
    street: 'Princeton Park Corporate Center, 1100 Cornwall Rd, Suite 200',
    city: 'South Brunswick',
    region: 'New Jersey',
    regionCode: 'NJ',
    postalCode: '08852',
    countryCode: 'US',
  },
  social: {
    facebook: 'https://www.facebook.com/gitsols/',
    instagram: 'https://www.instagram.com/gitsolsllc',
    linkedin: 'https://www.linkedin.com/company/gitsols-llc',
    youtube: 'https://www.youtube.com/@gitsolsllc',
    tiktok: 'https://www.tiktok.com/@gitsols.llc',
  },
  serviceArea: 'New Jersey · Tri-state · Nationwide remote',
  founded: '1999',
} as const

export const STATS = [
  { value: '24/7', label: 'Support coverage' },
  { value: '25+', label: 'Years experience' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '< 15 min', label: 'P1 response' },
] as const

export const VALUE_PROPS = [
  {
    title: 'Get paged before you notice',
    body: '24/7 monitoring with proactive remediation. Most tickets close before the client opens one.',
  },
  {
    title: 'HIPAA-aware from day one',
    body: 'Healthcare and financial clients run on infra audited for HIPAA, SOC 2, NIST, and NYDFS controls — without enterprise pricing.',
  },
  {
    title: 'One accountable team',
    body: 'Managed IT, cybersecurity, compliance, and bespoke software under one roof. No finger-pointing between vendors.',
  },
  {
    title: 'Strategy, not break-fix',
    body: 'Quarterly business reviews, technology roadmaps, and budget planning — IT aligned to your business goals.',
  },
] as const

// ─── Services ──────────────────────────────────────────────────────────────

export type ServiceCategory =
  | 'managed'
  | 'security'
  | 'cloud'
  | 'communications'
  | 'build'
  | 'marketing'

export interface Service {
  slug: string
  name: string
  shortName: string
  category: ServiceCategory
  /** One-line tagline used on cards and the hero subtitle. */
  tagline: string
  /** 2-3 sentence summary for cards. */
  summary: string
  /** Longer body for the detail page hero. */
  intro: string
  /** What's included — 4-6 deliverables. */
  capabilities: { title: string; body: string }[]
  /** Who this is for — 2-3 short profiles. */
  whoItsFor: string[]
  /** Related service slugs — drives the "see also" block on the detail page. */
  related: string[]
  /** SEO metadata. */
  metaTitle: string
  metaDescription: string
}

export const SERVICES: readonly Service[] = [
  {
    slug: 'managed-it',
    name: 'Managed IT Services',
    shortName: 'Managed IT',
    category: 'managed',
    tagline: 'Proactive IT management, fully staffed without the headcount.',
    summary:
      'Day-to-day IT operations, monitoring, patching, and helpdesk — run as if we were your in-house team.',
    intro:
      'Stable, secure, well-managed technology is the floor, not the ceiling. Our Managed IT Services handle infrastructure monitoring, patching, helpdesk, and end-user support across your environment — so your people focus on the work, not the systems.',
    capabilities: [
      {
        title: '24/7 proactive monitoring',
        body: 'Servers, endpoints, network gear, and SaaS health monitored continuously. We get paged before users do.',
      },
      {
        title: 'Unlimited helpdesk',
        body: 'Phone, email, and chat support for every user. Tickets resolved with SLAs you can show your board.',
      },
      {
        title: 'Patching & lifecycle management',
        body: 'OS, application, and firmware updates on a scheduled cadence with change control and rollback.',
      },
      {
        title: 'Vendor management',
        body: 'We own the call to Microsoft, your ISP, your line-of-business app vendor. One throat to choke.',
      },
      {
        title: 'Quarterly business reviews',
        body: 'Roadmap, budget, and risk review every quarter so technology decisions stay aligned with growth.',
      },
      {
        title: 'Onboarding & offboarding',
        body: 'New-hire provisioning and departing-employee deprovisioning handled the same way every time.',
      },
    ],
    whoItsFor: [
      'Medical and dental practices with 10-150 staff',
      'Financial services firms (RIAs, accounting, lending)',
      'Professional services firms transitioning off break-fix IT',
    ],
    related: ['cybersecurity', 'compliance', 'cloud'],
    metaTitle: 'Managed IT Services in New Jersey — GITSOLS',
    metaDescription:
      '24/7 managed IT, unlimited helpdesk, proactive monitoring, and quarterly strategy reviews from a New Jersey MSP built for medical, financial, and professional services firms.',
  },
  {
    slug: 'cybersecurity',
    name: 'Managed Cybersecurity',
    shortName: 'Cybersecurity',
    category: 'security',
    tagline: 'Defense-in-depth without the SOC price tag.',
    summary:
      'Endpoint protection, network security, identity hardening, and 24/7 threat monitoring layered together.',
    intro:
      'Cyber threats target small businesses precisely because their defenses are uneven. We layer endpoint, network, identity, email, and backup controls into a single managed program — with real human triage when alerts fire.',
    capabilities: [
      {
        title: 'Endpoint detection & response (EDR)',
        body: 'Next-gen antivirus with behavioral detection on every laptop and server. Quarantine on detection, not on hash match.',
      },
      {
        title: 'Email & phishing protection',
        body: 'Inbound mail filtering, anti-impersonation rules, and quarterly simulated phishing tests with reporting.',
      },
      {
        title: 'Identity hardening',
        body: 'MFA enforcement, conditional access, privileged account isolation, and quarterly access reviews.',
      },
      {
        title: 'Network security',
        body: 'Firewall config, network segmentation, VPN, DNS filtering, and continuous vulnerability scanning.',
      },
      {
        title: 'Backup & disaster recovery',
        body: 'Immutable backups, regular restore drills, documented RTO/RPO — the part of cyber most MSPs skip.',
      },
      {
        title: 'Incident response',
        body: 'Pre-agreed runbook, retained forensic partner, and reporting templates for breach notification.',
      },
    ],
    whoItsFor: [
      'HIPAA-covered medical practices and BAs',
      'Financial firms subject to SEC, FINRA, or NYDFS oversight',
      'Any business carrying cyber-insurance attestation requirements',
    ],
    related: ['managed-it', 'compliance', 'network'],
    metaTitle: 'Managed Cybersecurity Services — GITSOLS NJ',
    metaDescription:
      'EDR, email security, identity hardening, network security, backup, and incident response delivered as one managed program. Built for healthcare and financial clients.',
  },
  {
    slug: 'compliance',
    name: 'IT Compliance Services',
    shortName: 'Compliance',
    category: 'security',
    tagline: 'HIPAA, SOC 2, NIST — documented, defensible, audit-ready.',
    summary:
      'Compliance program design, control implementation, evidence collection, and audit support across major frameworks.',
    intro:
      'Audits are won in the year you collect evidence, not the week your auditor shows up. We build your compliance program around the technical controls we manage — so artifacts generate themselves and your team stays focused on the work.',
    capabilities: [
      {
        title: 'HIPAA Security Rule program',
        body: 'Risk assessment, safeguards (administrative, physical, technical), BAA template, breach response plan.',
      },
      {
        title: 'SOC 2 readiness',
        body: 'Trust services criteria mapping, policy authoring, control implementation, and Type I / Type II audit support.',
      },
      {
        title: 'NIST CSF & 800-171',
        body: 'CSF maturity baseline, gap analysis, and 800-171 controls for CMMC and federal-adjacent work.',
      },
      {
        title: 'NYDFS 23 NYCRR 500',
        body: 'For financial firms under NY DFS — risk assessment, CISO function, MFA, encryption, incident response.',
      },
      {
        title: 'Evidence collection & dashboards',
        body: 'Continuous evidence collection (Drata, Vanta, or homegrown) so audit prep is a download, not a fire drill.',
      },
      {
        title: 'Vendor risk management',
        body: 'Third-party inventory, security questionnaires, and ongoing monitoring of your critical vendors.',
      },
    ],
    whoItsFor: [
      'Practices handling PHI under HIPAA',
      'SaaS companies entering enterprise sales conversations',
      'RIAs, broker-dealers, and lenders with NYDFS exposure',
    ],
    related: ['cybersecurity', 'managed-it', 'cloud'],
    metaTitle: 'IT Compliance Services (HIPAA · SOC 2 · NIST) — GITSOLS',
    metaDescription:
      'Compliance program design and audit support for HIPAA, SOC 2, NIST CSF, NIST 800-171, and NYDFS 23 NYCRR 500 — built around the controls we already manage.',
  },
  {
    slug: 'cloud',
    name: 'Managed Cloud Services',
    shortName: 'Cloud',
    category: 'cloud',
    tagline: 'Cloud architecture, migration, and FinOps — without the consulting markup.',
    summary:
      'Azure, AWS, and hybrid environment design, migration, optimization, and ongoing management.',
    intro:
      'Cloud is leverage when it is well-architected and expensive theater when it is not. We design, migrate, and run cloud environments with cost guardrails baked in — so you get the elasticity without the surprise invoice.',
    capabilities: [
      {
        title: 'Migration planning & execution',
        body: 'Discovery, dependency mapping, wave planning, cutover, and post-migration validation for line-of-business apps.',
      },
      {
        title: 'Azure & AWS architecture',
        body: 'Landing zones, network design, identity integration, and policy-as-code from day one.',
      },
      {
        title: 'FinOps & cost optimization',
        body: 'Right-sizing, reservation planning, anomaly alerts, and monthly cost reports leadership actually reads.',
      },
      {
        title: 'Identity & access',
        body: 'Microsoft Entra / AWS IAM Identity Center setup with conditional access and privileged-access workflows.',
      },
      {
        title: 'Backup & DR',
        body: 'Cross-region backup, recovery runbooks, and quarterly restore drills.',
      },
      {
        title: 'Ongoing platform management',
        body: 'Patching, monitoring, incident response, and capacity planning as a continuous service.',
      },
    ],
    whoItsFor: [
      'Practices migrating EHR or PMS workloads to the cloud',
      'Financial firms consolidating on Microsoft 365 and Azure',
      'Any business carrying surprise cloud spend',
    ],
    related: ['managed-it', 'cybersecurity', 'network'],
    metaTitle: 'Managed Cloud Services (Azure · AWS) — GITSOLS',
    metaDescription:
      'Cloud architecture, migration, FinOps cost optimization, and managed platform operations on Microsoft Azure and AWS for regulated New Jersey businesses.',
  },
  {
    slug: 'business-phone',
    name: 'Business Phone System',
    shortName: 'Phone System',
    category: 'communications',
    tagline: 'Cloud phone systems built for the way your team actually works.',
    summary:
      'Hosted PBX, VoIP, and call-flow design — including front-office routing, IVR, and reporting.',
    intro:
      'Phones are still the front door for medical practices and financial firms. Our business phone systems get the basics right (uptime, call quality, voicemail-to-email) and the hard parts right too (call flows, after-hours routing, compliance recording).',
    capabilities: [
      {
        title: 'Hosted PBX & VoIP',
        body: 'Cloud-hosted PBX with desk phones, softphones, and mobile apps that share a single extension.',
      },
      {
        title: 'IVR & call routing',
        body: 'Intelligent call flows — front-office routing, after-hours, holiday schedules, overflow rules.',
      },
      {
        title: 'Call recording & retention',
        body: 'Recording with retention policies that meet HIPAA and financial-services requirements.',
      },
      {
        title: 'Reporting & analytics',
        body: 'Inbound volume, abandoned calls, hold times, agent utilization — visibility for office managers.',
      },
      {
        title: 'SMS & fax',
        body: 'Business SMS from your main number, secure fax, and integrations with EHR/PMS where supported.',
      },
      {
        title: 'Porting & cutover',
        body: 'We port your existing numbers, coordinate with your carrier, and cut over after hours.',
      },
    ],
    whoItsFor: [
      'Medical practices with high inbound call volume',
      'Multi-location firms needing one phone tree across sites',
      'Teams switching from POTS lines or legacy PBX',
    ],
    related: ['communications', 'managed-it', 'network'],
    metaTitle: 'Business Phone Systems & Cloud VoIP — GITSOLS',
    metaDescription:
      'Hosted PBX, VoIP, IVR call flows, HIPAA-aware call recording, and reporting for medical and financial firms across New Jersey and nationwide.',
  },
  {
    slug: 'communications',
    name: 'Unified Communications',
    shortName: 'Unified Comms',
    category: 'communications',
    tagline: 'Voice, video, chat, and meetings on one platform your team actually uses.',
    summary:
      'Microsoft Teams Phone, Zoom, or RingCentral — designed, deployed, and managed end-to-end.',
    intro:
      'Unified communications fails when it is bolted on. We design, deploy, and govern voice, video, chat, and meeting platforms together so users have one place to communicate and IT has one place to manage policy.',
    capabilities: [
      {
        title: 'Teams Phone deployment',
        body: 'Direct routing, calling plans, auto-attendants, call queues, and Teams-native PBX replacement.',
      },
      {
        title: 'Video & meetings',
        body: 'Teams, Zoom, or Google Meet with conference-room hardware, recording policy, and compliance retention.',
      },
      {
        title: 'Chat governance',
        body: 'Information barriers, retention, eDiscovery, and DLP for chat content — required for financial and healthcare.',
      },
      {
        title: 'Mobile & BYOD',
        body: 'Mobile apps with conditional access, MAM policies, and a remote-wipe story for lost devices.',
      },
      {
        title: 'Conference rooms',
        body: 'Room hardware (Logitech, Poly, Yealink), Teams Rooms certification, and one-click join from calendar.',
      },
      {
        title: 'Adoption & training',
        body: 'Rollout plans, lunch-and-learns, and admin-side governance so the platform earns its license cost.',
      },
    ],
    whoItsFor: [
      'Distributed teams consolidating off ad-hoc tools',
      'Practices needing HIPAA-compliant video visits',
      'Firms standardizing on Microsoft 365 or Google Workspace',
    ],
    related: ['business-phone', 'cloud', 'managed-it'],
    metaTitle: 'Unified Communications — Microsoft Teams Phone & Zoom — GITSOLS',
    metaDescription:
      'Microsoft Teams Phone, Zoom, and unified communications design, deployment, and ongoing governance for regulated New Jersey businesses.',
  },
  {
    slug: 'network',
    name: 'Network Setup & Support',
    shortName: 'Network',
    category: 'managed',
    tagline: 'Network design and ongoing support that keeps connectivity invisible.',
    summary:
      'Site surveys, structured cabling, switching, Wi-Fi, firewalls, SD-WAN, and ongoing monitoring.',
    intro:
      'A great network is one nobody notices. We design, install, monitor, and maintain wired and wireless networks — from single-site practices to multi-site organizations on SD-WAN.',
    capabilities: [
      {
        title: 'Site survey & design',
        body: 'Heat maps, structured cabling plans, equipment selection, and capacity planning for current + 3-year needs.',
      },
      {
        title: 'Switching & Wi-Fi',
        body: 'Cisco Meraki, Aruba, Ubiquiti, or Fortinet — selected based on management needs and budget.',
      },
      {
        title: 'Firewalls & SD-WAN',
        body: 'Next-gen firewalls with IPS, web filtering, VPN, and SD-WAN for multi-site or hybrid-cloud environments.',
      },
      {
        title: 'VPN & remote access',
        body: 'Always-on VPN, zero-trust network access (ZTNA), and split-tunnel policy that survives audit.',
      },
      {
        title: '24/7 monitoring',
        body: 'Network performance, link saturation, and outage alerts piped into our NOC.',
      },
      {
        title: 'On-site response',
        body: 'New Jersey and tri-state on-site response when something physical needs hands.',
      },
    ],
    whoItsFor: [
      'New office buildouts and relocations',
      'Multi-site organizations standardizing connectivity',
      'Practices replacing aging consumer-grade equipment',
    ],
    related: ['managed-it', 'cybersecurity', 'cloud'],
    metaTitle: 'Network Setup & Support in New Jersey — GITSOLS',
    metaDescription:
      'Network design, structured cabling, switching, Wi-Fi, firewalls, SD-WAN, and 24/7 monitoring for New Jersey businesses and multi-site organizations.',
  },
  {
    slug: 'bespoke-software',
    name: 'Bespoke Software Development',
    shortName: 'Bespoke Software',
    category: 'build',
    tagline: 'Custom web, mobile, and AI built by the team that runs your infrastructure.',
    summary:
      'Web apps, mobile apps, custom CRMs, and AI tools — owned codebase, no vendor lock-in, HIPAA-aware by default.',
    intro:
      'Buy when you can, build when you have to. When existing tools force compromise on workflow, compliance, or integrations, our engineering team designs and ships purpose-built software — in your AWS, Azure, or on-prem environment, on a codebase you own.',
    capabilities: [
      {
        title: 'Custom web apps',
        body: 'Internal tools, customer portals, dashboards, and SaaS MVPs on a modern stack (Next.js + NestJS + Postgres).',
      },
      {
        title: 'Custom mobile apps',
        body: 'iOS + Android from one React Native / Expo codebase, with App Store / Play Store submission handled.',
      },
      {
        title: 'Custom CRMs & operational tools',
        body: 'Purpose-built CRMs and ops platforms when Salesforce or HubSpot is wrong-shaped — vertical specific.',
      },
      {
        title: 'AI integrations',
        body: 'Claude-powered agents, RAG over your documents, document extraction, voice/SMS bots, automated triage.',
      },
      {
        title: 'Integrations & automations',
        body: 'EHR ↔ billing, M365 ↔ CRM, accounting ↔ ops — wiring existing tools so data stops being copy-pasted.',
      },
      {
        title: 'HIPAA-aware delivery',
        body: 'Encryption, audit logging, RBAC, SSO, and BAA-eligible hosting on track from kickoff, not bolted on later.',
      },
    ],
    whoItsFor: [
      'Practices on spreadsheets-as-software, ready to operationalize',
      'Firms hitting the wall on Salesforce / HubSpot / off-the-shelf tools',
      'Founders building a vertical SaaS who need a credible engineering partner',
    ],
    related: ['cloud', 'compliance', 'cybersecurity'],
    metaTitle: 'Bespoke Software Development (Web · Mobile · AI) — GITSOLS',
    metaDescription:
      'Custom web apps, mobile apps, CRMs, and AI tools built by the GITSOLS engineering team — HIPAA-aware, owned codebase, no vendor lock-in.',
  },
  {
    slug: 'digital-marketing',
    name: 'Digital Marketing',
    shortName: 'Marketing',
    category: 'marketing',
    tagline: 'Demand generation for practices that need a full appointment book.',
    summary:
      'SEO, paid search, social, and reputation management — run by the team that already secures your infrastructure, so patient and client data stays protected.',
    intro:
      'Most marketing agencies do not understand HIPAA, and most MSPs do not do marketing. We do both. GITSOLS runs measurable demand-generation programs — local SEO, Google and Meta ads, social, and reputation management — wired into a CRM you own, with the same compliance discipline we bring to your network.',
    capabilities: [
      {
        title: 'Local SEO & Google Business Profile',
        body: 'Rank for the searches that fill your schedule. Citations, on-page SEO, GBP optimization, and review velocity.',
      },
      {
        title: 'Paid search & social ads',
        body: 'Google, Meta, and LinkedIn campaigns with conversion tracking, landing pages, and weekly optimization.',
      },
      {
        title: 'Reputation management',
        body: 'Automated review requests after every visit, response workflows, and reputation monitoring across platforms.',
      },
      {
        title: 'Content & email marketing',
        body: 'Newsletters, nurture sequences, and content built for healthcare and financial audiences — compliant by design.',
      },
      {
        title: 'Conversion tracking & reporting',
        body: 'Every lead attributed to a source. Monthly reporting tied to booked appointments and revenue, not vanity metrics.',
      },
      {
        title: 'Marketing + IT under one roof',
        body: 'Your CRM, website, and ad pixels managed by the same team that runs your security — no data handed to strangers.',
      },
    ],
    whoItsFor: [
      'Medical and dental practices adding locations or providers',
      'Behavioral health and specialty clinics filling new-patient slots',
      'Professional services firms that need a predictable lead pipeline',
    ],
    related: ['ghl-implementation', 'bespoke-software', 'managed-it'],
    metaTitle: 'Digital Marketing for Healthcare & Professional Services — GITSOLS',
    metaDescription:
      'HIPAA-aware digital marketing: local SEO, paid ads, reputation management, and CRM — run by the team that secures your infrastructure. New Jersey & nationwide.',
  },
  {
    slug: 'ghl-implementation',
    name: 'GoHighLevel Implementation',
    shortName: 'GoHighLevel',
    category: 'marketing',
    tagline: 'A complete GoHighLevel build-out — funnels, pipelines, and automation done right.',
    summary:
      'Full GoHighLevel (GHL) sub-account setup and management: lead pipelines, funnels, missed-call text-back, review automation, and nurture workflows — configured for your practice and handed over running.',
    intro:
      'GoHighLevel is powerful and easy to misconfigure. We implement it end to end — your sub-account, pipelines, calendars, funnels, and automations — then either hand it over or run it for you. Every workflow is mapped to how your front office actually books, follows up, and retains clients.',
    capabilities: [
      {
        title: 'Sub-account & pipeline setup',
        body: 'A clean GHL sub-account with sales and patient pipelines, custom fields, calendars, and user roles configured.',
      },
      {
        title: 'Funnels & landing pages',
        body: 'High-converting funnels and landing pages for each service line, wired to forms, calendars, and tracking.',
      },
      {
        title: 'Missed-call text-back & speed-to-lead',
        body: 'Never lose a lead: automatic SMS on missed calls, instant lead routing, and speed-to-lead automations.',
      },
      {
        title: 'Review & reputation automation',
        body: 'Automated review requests, response templates, and reputation workflows that compound over time.',
      },
      {
        title: 'Nurture & reactivation workflows',
        body: 'Email/SMS nurture sequences and database-reactivation campaigns that turn dormant lists into booked appointments.',
      },
      {
        title: 'Training, handover & ongoing management',
        body: 'Documented handover and staff training — or a monthly retainer where we run and optimize the whole thing.',
      },
    ],
    whoItsFor: [
      'Practices replacing a patchwork of point tools with one platform',
      'Owners who bought GoHighLevel but never got it fully set up',
      'Teams that want lead follow-up and reviews fully automated',
    ],
    related: ['digital-marketing', 'bespoke-software', 'managed-it'],
    metaTitle: 'GoHighLevel Implementation & Management — GITSOLS',
    metaDescription:
      'Done-for-you GoHighLevel setup: pipelines, funnels, missed-call text-back, review and nurture automation, plus optional ongoing management. Built and handed over running.',
  },
] as const

export function getServiceBySlug(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug)
}

export const SERVICE_SLUGS = SERVICES.map((s) => s.slug)

// ─── Industries ────────────────────────────────────────────────────────────

export interface Industry {
  slug: string
  name: string
  shortName: string
  tagline: string
  summary: string
  intro: string
  compliance: string[]
  /** Services most relevant to this vertical (slugs). */
  recommendedServices: string[]
  /** Concrete buyer pain points — quoted on the page. */
  painPoints: string[]
  metaTitle: string
  metaDescription: string
}

export const INDUSTRIES: readonly Industry[] = [
  {
    slug: 'healthcare',
    name: 'Healthcare & Medical Practices',
    shortName: 'Healthcare',
    tagline: 'IT and compliance built for HIPAA-covered practices.',
    summary:
      'Medical, dental, and behavioral health practices supported by a team fluent in HIPAA, EHR/PMS environments, and clinical workflow.',
    intro:
      'Healthcare IT fails when generic MSPs treat HIPAA as documentation. We treat it as the design constraint — every control we deploy maps to a Security Rule safeguard, every change is logged, and your EHR/PMS uptime is the metric we manage to.',
    compliance: [
      'HIPAA Security Rule (administrative, physical, technical safeguards)',
      'HIPAA Privacy Rule operational support',
      'HITECH breach notification readiness',
      'Business Associate Agreements (BAAs) with downstream vendors',
      'OCR audit response preparation',
    ],
    recommendedServices: [
      'compliance',
      'cybersecurity',
      'managed-it',
      'business-phone',
      'bespoke-software',
    ],
    painPoints: [
      'EHR/PMS outages that idle the schedule',
      'Phishing attacks targeting front-office staff',
      'OCR audit letters and breach-notification anxiety',
      'New-hire credentialing taking days instead of hours',
      'Telehealth video that fails right before the appointment',
    ],
    metaTitle: 'Healthcare IT & HIPAA Compliance — GITSOLS',
    metaDescription:
      'Managed IT, cybersecurity, and HIPAA compliance for medical, dental, and behavioral health practices in New Jersey and nationwide.',
  },
  {
    slug: 'financial-services',
    name: 'Financial Services',
    shortName: 'Financial',
    tagline: 'Secure, compliant IT for RIAs, accounting firms, and lenders.',
    summary:
      'Financial firms supported by a team that understands SEC, FINRA, NYDFS, and IRS-IRS Publication 1075 implications of every IT decision.',
    intro:
      'Financial firms run on trust and on records. We deliver the security controls regulators expect, the uptime your clients expect, and the audit evidence that turns the next exam into a download instead of a fire drill.',
    compliance: [
      'NYDFS 23 NYCRR 500 (Cybersecurity Regulation)',
      'SEC Reg S-P and Reg S-ID',
      'FINRA cybersecurity guidance',
      'IRS Publication 1075 (for tax preparers)',
      'GLBA Safeguards Rule',
      'SOC 2 for service providers',
    ],
    recommendedServices: [
      'cybersecurity',
      'compliance',
      'managed-it',
      'cloud',
      'communications',
    ],
    painPoints: [
      'NYDFS exam readiness',
      'Email impersonation and wire-fraud risk',
      'Aging on-prem servers approaching end-of-life',
      'Remote work and BYOD without conditional access',
      'Vendor risk questionnaires nobody owns',
    ],
    metaTitle: 'IT for Financial Services — NYDFS · SEC · FINRA — GITSOLS',
    metaDescription:
      'Cybersecurity, compliance, and managed IT for RIAs, accounting firms, lenders, and broker-dealers under SEC, FINRA, NYDFS, and GLBA oversight.',
  },
  {
    slug: 'professional-services',
    name: 'Professional Services',
    shortName: 'Professional Services',
    tagline: 'Modern IT for law firms, consultancies, and growing teams.',
    summary:
      'Law firms, consultancies, agencies, and professional services teams that need enterprise-grade IT without an in-house department.',
    intro:
      'Professional services firms scale on people and reputation. We give your team modern infrastructure, secure remote work, and predictable IT spend — so partners stop running IT and start billing instead.',
    compliance: [
      'ABA Model Rule 1.6 confidentiality',
      'Client engagement letter security commitments',
      'SOC 2 for tooling vendors',
      'State data-breach notification laws',
    ],
    recommendedServices: [
      'managed-it',
      'cybersecurity',
      'communications',
      'cloud',
      'bespoke-software',
    ],
    painPoints: [
      'Partner laptops, partner-managed, partner-pain',
      'Document management drift across multiple tools',
      'Mergers requiring IT consolidation across firms',
      'Client portals that look amateur next to BigLaw',
      'On-call IT eating partner billable hours',
    ],
    metaTitle: 'IT for Law Firms & Professional Services — GITSOLS',
    metaDescription:
      'Modern managed IT, cybersecurity, and unified communications for law firms, consultancies, and professional services firms in New Jersey and nationwide.',
  },
] as const

export function getIndustryBySlug(slug: string): Industry | undefined {
  return INDUSTRIES.find((i) => i.slug === slug)
}

export const INDUSTRY_SLUGS = INDUSTRIES.map((i) => i.slug)

// ─── Engagement lifecycle (drives /process page) ───────────────────────────

export interface ProcessStage {
  number: number
  title: string
  owner: string
  duration: string
  description: string
  artifacts: string[]
  clientVisibility: 'private' | 'shared' | 'portal'
}

export const PROCESS_STAGES: readonly ProcessStage[] = [
  {
    number: 1,
    title: 'Inquiry',
    owner: 'Sales',
    duration: '1-2 days',
    description:
      'You reach out via the audit form, phone, or referral. We confirm fit and schedule a discovery call.',
    artifacts: ['Lead record', 'Intake notes'],
    clientVisibility: 'private',
  },
  {
    number: 2,
    title: 'Discovery',
    owner: 'Sales + PM',
    duration: '1-3 weeks',
    description:
      'We audit your current environment — network, endpoints, identity, backup posture, compliance gaps — and document findings.',
    artifacts: ['IT audit findings', 'Risk assessment', 'Scoping doc'],
    clientVisibility: 'shared',
  },
  {
    number: 3,
    title: 'Proposal & SoW',
    owner: 'Sales',
    duration: '3-7 days',
    description:
      'Priced, milestoned Statement of Work plus the MSA. Sent for review through DocuSeal — countersigned online.',
    artifacts: ['Proposal', 'SoW', 'MSA'],
    clientVisibility: 'shared',
  },
  {
    number: 4,
    title: 'Kickoff',
    owner: 'Project Manager',
    duration: '1 week',
    description:
      'Once the SoW is signed we create your engagement, build the milestone plan from a template, and provision your client portal accounts.',
    artifacts: ['Engagement record', 'Milestone plan', 'Portal accounts'],
    clientVisibility: 'portal',
  },
  {
    number: 5,
    title: 'Execution',
    owner: 'PM + Engineers',
    duration: 'Varies by scope',
    description:
      'We execute against the milestone plan. Status updates, evidence, and deliverables show up live in your portal — no more "where are we?" emails.',
    artifacts: ['Tasks', 'Deliverables', 'Evidence', 'Status updates'],
    clientVisibility: 'portal',
  },
  {
    number: 6,
    title: 'Milestone approval',
    owner: 'Client primary',
    duration: 'On demand',
    description:
      'Each milestone closes with your sign-off in the portal. One click to approve, optional 1-5 rating and comment so we know how we are doing.',
    artifacts: ['Approval record', 'Feedback rating', 'Comment'],
    clientVisibility: 'portal',
  },
  {
    number: 7,
    title: 'Delivery & go-live',
    owner: 'Project Manager',
    duration: '1-2 weeks',
    description:
      'Final milestone completes. You get a handoff package — runbook, configurations, training — and the engagement transitions to ongoing support.',
    artifacts: ['Handoff doc', 'Runbook', 'Training session'],
    clientVisibility: 'portal',
  },
  {
    number: 8,
    title: 'Ongoing operations',
    owner: 'Account Manager',
    duration: 'Continuous',
    description:
      'Monthly reports, ticket SLA tracking, quarterly business reviews, and proactive recommendations. Your portal stays the single source of truth.',
    artifacts: ['Monthly reports', 'QBR deck', 'Renewal proposal'],
    clientVisibility: 'portal',
  },
  {
    number: 9,
    title: 'Renewal',
    owner: 'Account Manager',
    duration: '60 days before term',
    description:
      'We surface renewal terms 60 days before contract end, including any scope changes from QBR discussions and feedback signals.',
    artifacts: ['Renewal proposal'],
    clientVisibility: 'shared',
  },
] as const

// ─── Service-category groupings (for nav + filtering) ──────────────────────

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  managed: 'Managed IT',
  security: 'Security & Compliance',
  cloud: 'Cloud',
  communications: 'Communications',
  build: 'Build',
  marketing: 'Marketing & Growth',
}
