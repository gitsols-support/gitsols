// NOC check catalog + category metadata.
//
// Each entry is the seed for `noc_check_definitions`. The agent fetches its
// active subset based on per-client `noc_client_configs` overrides. See
// `noc-architecture.md` at the repo root for the design and the full list of
// 30+ checks we ship in v1.

import type {
  NocCheckCategory,
  NocCheckDefinition,
  NocCheckSeverity,
  NocEndpointStatus,
  NocOsFamily,
} from '@gitsols/types'

// ─── Category metadata (icons, labels, copy) ──────────────────────────────

export const NOC_CATEGORY_LABELS: Record<NocCheckCategory, string> = {
  encryption: 'Encryption',
  patching: 'Patching',
  identity: 'Identity',
  edr_av: 'EDR / AV',
  backup: 'Backup',
  network: 'Network',
  lob_app: 'LOB applications',
  compliance: 'Compliance',
  inventory: 'Inventory',
  custom: 'Custom',
}

export const NOC_CATEGORY_BLURBS: Record<NocCheckCategory, string> = {
  encryption: 'Full-disk encryption posture and recovery key escrow.',
  patching: 'OS and third-party patch currency, reboot pending.',
  identity: 'MFA enrollment, local admin hygiene, password age.',
  edr_av: 'EDR / AV runtime health, signature freshness, last scan.',
  backup: 'Last successful backup, integrity verification, RPO.',
  network: 'VPN tunnels, DNS, WAN reachability, certificate expiry.',
  lob_app: 'Line-of-business applications: process up, port listening.',
  compliance: 'HIPAA / PCI / SOC control attestation signals.',
  inventory: 'Software and hardware inventory drift detection.',
  custom: 'Customer-defined checks unique to this engagement.',
}

export const NOC_SEVERITY_LABELS: Record<NocCheckSeverity, string> = {
  info: 'Info',
  warn: 'Warning',
  critical: 'Critical',
}

export const NOC_STATUS_LABELS: Record<NocEndpointStatus, string> = {
  healthy: 'Healthy',
  warning: 'Warning',
  critical: 'Critical',
  offline: 'Offline',
  unenrolled: 'Unenrolled',
}

export const NOC_STATUS_TONES: Record<
  NocEndpointStatus,
  'good' | 'warn' | 'bad' | 'muted'
> = {
  healthy: 'good',
  warning: 'warn',
  critical: 'bad',
  offline: 'muted',
  unenrolled: 'muted',
}

// ─── Built-in check catalog ───────────────────────────────────────────────

const ALL_DESKTOP: NocOsFamily[] = ['windows', 'macos', 'linux']
const WIN_ONLY: NocOsFamily[] = ['windows']
const MAC_ONLY: NocOsFamily[] = ['macos']

export const NOC_CHECK_CATALOG: NocCheckDefinition[] = [
  // ─── Encryption ─────────────────────────────────────────────────────────
  {
    slug: 'bitlocker_on',
    name: 'BitLocker is enabled',
    description:
      'System volume is BitLocker-encrypted and protection status is on.',
    category: 'encryption',
    defaultSeverity: 'critical',
    defaultScheduleMinutes: 60,
    appliesTo: WIN_ONLY,
    hipaaControl: '164.312(a)(2)(iv)',
    defaultRunbookSlug: 'enable-bitlocker',
  },
  {
    slug: 'filevault_on',
    name: 'FileVault is enabled',
    description: 'macOS FileVault is on and recovery key is escrowed.',
    category: 'encryption',
    defaultSeverity: 'critical',
    defaultScheduleMinutes: 60,
    appliesTo: MAC_ONLY,
    hipaaControl: '164.312(a)(2)(iv)',
    defaultRunbookSlug: 'enable-filevault',
  },
  {
    slug: 'recovery_key_escrowed',
    name: 'Recovery key is escrowed in GITSOLS vault',
    description:
      'Encryption recovery key is present in our vault, not only local.',
    category: 'encryption',
    defaultSeverity: 'warn',
    defaultScheduleMinutes: 240,
    appliesTo: ALL_DESKTOP,
    hipaaControl: '164.308(a)(7)',
    defaultRunbookSlug: 'escrow-recovery-key',
  },

  // ─── Patching ───────────────────────────────────────────────────────────
  {
    slug: 'os_patch_lag_30d',
    name: 'OS patches current (<30d)',
    description: 'Last successful OS patch installed within the last 30 days.',
    category: 'patching',
    defaultSeverity: 'warn',
    defaultScheduleMinutes: 360,
    appliesTo: ALL_DESKTOP,
    hipaaControl: '164.308(a)(5)(ii)(B)',
    defaultRunbookSlug: 'os-patch-overdue',
  },
  {
    slug: 'third_party_patch_lag_60d',
    name: 'Third-party apps current (<60d)',
    description:
      'Browsers, runtimes, and Adobe stack last updated within 60 days.',
    category: 'patching',
    defaultSeverity: 'warn',
    defaultScheduleMinutes: 720,
    appliesTo: ALL_DESKTOP,
    hipaaControl: '164.308(a)(5)(ii)(B)',
    defaultRunbookSlug: 'third-party-patch-overdue',
  },
  {
    slug: 'reboot_pending',
    name: 'No reboot pending > 7 days',
    description:
      'Endpoint has not deferred a required reboot for more than a week.',
    category: 'patching',
    defaultSeverity: 'warn',
    defaultScheduleMinutes: 60,
    appliesTo: ALL_DESKTOP,
    defaultRunbookSlug: 'reboot-pending',
  },

  // ─── Identity ───────────────────────────────────────────────────────────
  {
    slug: 'local_admin_disabled',
    name: 'Local Administrator account is disabled',
    description: 'The built-in admin/root account is disabled or renamed.',
    category: 'identity',
    defaultSeverity: 'warn',
    defaultScheduleMinutes: 1440,
    appliesTo: ALL_DESKTOP,
    hipaaControl: '164.308(a)(3)(ii)(A)',
    defaultRunbookSlug: 'disable-local-admin',
  },
  {
    slug: 'password_age_max_90d',
    name: 'No interactive account password older than 90d',
    description: 'No console-logon-capable account password aged > 90 days.',
    category: 'identity',
    defaultSeverity: 'warn',
    defaultScheduleMinutes: 1440,
    appliesTo: ALL_DESKTOP,
    defaultRunbookSlug: 'password-rotation',
  },
  {
    slug: 'mfa_enrolled',
    name: 'M365 / IdP MFA enrolled for logged-in user',
    description:
      'Primary identity provider reports MFA enrollment for this user.',
    category: 'identity',
    defaultSeverity: 'critical',
    defaultScheduleMinutes: 1440,
    appliesTo: ALL_DESKTOP,
    hipaaControl: '164.312(d)',
    defaultRunbookSlug: 'enroll-mfa',
  },

  // ─── EDR / AV ───────────────────────────────────────────────────────────
  {
    slug: 'defender_running',
    name: 'Microsoft Defender real-time protection is on',
    description: 'Defender service running with real-time protection enabled.',
    category: 'edr_av',
    defaultSeverity: 'critical',
    defaultScheduleMinutes: 30,
    appliesTo: WIN_ONLY,
    hipaaControl: '164.308(a)(5)(ii)(B)',
    defaultRunbookSlug: 'defender-not-running',
  },
  {
    slug: 'edr_agent_running',
    name: 'EDR agent (Huntress / SentinelOne) is running',
    description: 'Approved EDR agent process is present and healthy.',
    category: 'edr_av',
    defaultSeverity: 'critical',
    defaultScheduleMinutes: 30,
    appliesTo: ALL_DESKTOP,
    hipaaControl: '164.308(a)(5)(ii)(B)',
    defaultRunbookSlug: 'edr-agent-down',
  },
  {
    slug: 'signatures_fresh_24h',
    name: 'AV signatures fresher than 24h',
    description: 'AV / EDR engine reports signature update within 24 hours.',
    category: 'edr_av',
    defaultSeverity: 'warn',
    defaultScheduleMinutes: 120,
    appliesTo: ALL_DESKTOP,
    defaultRunbookSlug: 'signatures-stale',
  },
  {
    slug: 'full_scan_within_14d',
    name: 'Full scan completed in last 14d',
    description: 'A full-disk EDR/AV scan has completed in the last 14 days.',
    category: 'edr_av',
    defaultSeverity: 'info',
    defaultScheduleMinutes: 1440,
    appliesTo: ALL_DESKTOP,
    defaultRunbookSlug: 'full-scan-stale',
  },

  // ─── Backup ─────────────────────────────────────────────────────────────
  {
    slug: 'backup_last_success_24h',
    name: 'Backup succeeded in last 24h',
    description:
      'Configured backup target reports a successful job in the last 24h.',
    category: 'backup',
    defaultSeverity: 'critical',
    defaultScheduleMinutes: 60,
    appliesTo: ALL_DESKTOP,
    hipaaControl: '164.308(a)(7)(ii)(A)',
    defaultRunbookSlug: 'backup-failed',
  },
  {
    slug: 'backup_integrity_check',
    name: 'Backup integrity verified weekly',
    description:
      'Most recent restore test or integrity verification within 7 days.',
    category: 'backup',
    defaultSeverity: 'warn',
    defaultScheduleMinutes: 1440,
    appliesTo: ALL_DESKTOP,
    hipaaControl: '164.308(a)(7)(ii)(D)',
    defaultRunbookSlug: 'backup-integrity',
  },

  // ─── Network ────────────────────────────────────────────────────────────
  {
    slug: 'wan_reachable',
    name: 'WAN reachable (public DNS)',
    description: 'Endpoint can resolve and ping 1.1.1.1 and 8.8.8.8.',
    category: 'network',
    defaultSeverity: 'critical',
    defaultScheduleMinutes: 15,
    appliesTo: ALL_DESKTOP,
    defaultRunbookSlug: 'wan-unreachable',
  },
  {
    slug: 'dns_resolution_ok',
    name: 'DNS resolution healthy',
    description:
      'Endpoint resolves a known FQDN within 200ms via configured resolver.',
    category: 'network',
    defaultSeverity: 'warn',
    defaultScheduleMinutes: 15,
    appliesTo: ALL_DESKTOP,
    defaultRunbookSlug: 'dns-slow',
  },
  {
    slug: 'vpn_tunnel_up',
    name: 'Site VPN tunnel is up',
    description:
      'For endpoints flagged as VPN-routed, the tunnel interface is up.',
    category: 'network',
    defaultSeverity: 'warn',
    defaultScheduleMinutes: 30,
    appliesTo: ALL_DESKTOP,
    defaultRunbookSlug: 'vpn-down',
  },
  {
    slug: 'cert_expiry_30d',
    name: 'No watched TLS cert expires in 30d',
    description:
      'External certificates this endpoint serves expire in > 30 days.',
    category: 'network',
    defaultSeverity: 'warn',
    defaultScheduleMinutes: 1440,
    appliesTo: ALL_DESKTOP,
    defaultRunbookSlug: 'cert-expiring',
  },

  // ─── Line-of-business apps ──────────────────────────────────────────────
  {
    slug: 'lob_process_running',
    name: 'LOB application process is running',
    description:
      'Customer-named EHR / PMS / LOB executable is present in the process table.',
    category: 'lob_app',
    defaultSeverity: 'critical',
    defaultScheduleMinutes: 15,
    appliesTo: ALL_DESKTOP,
    defaultRunbookSlug: 'lob-down',
  },
  {
    slug: 'lob_port_listening',
    name: 'LOB application is listening on expected port',
    description: 'Customer-defined port is in LISTEN state.',
    category: 'lob_app',
    defaultSeverity: 'critical',
    defaultScheduleMinutes: 15,
    appliesTo: ALL_DESKTOP,
    defaultRunbookSlug: 'lob-port-closed',
  },

  // ─── Compliance ─────────────────────────────────────────────────────────
  {
    slug: 'audit_log_forwarder_running',
    name: 'Audit log forwarder is running',
    description:
      'Wazuh / Vector / NXLog agent is shipping logs to the GITSOLS SIEM.',
    category: 'compliance',
    defaultSeverity: 'warn',
    defaultScheduleMinutes: 30,
    appliesTo: ALL_DESKTOP,
    hipaaControl: '164.312(b)',
    defaultRunbookSlug: 'log-forwarder-down',
  },
  {
    slug: 'screen_lock_15m',
    name: 'Idle screen lock ≤ 15 minutes',
    description:
      'Auto-lock / screensaver timeout is set to 15 minutes or less.',
    category: 'compliance',
    defaultSeverity: 'warn',
    defaultScheduleMinutes: 1440,
    appliesTo: ALL_DESKTOP,
    hipaaControl: '164.312(a)(2)(iii)',
    defaultRunbookSlug: 'screen-lock-policy',
  },
  {
    slug: 'usb_policy_enforced',
    name: 'USB removable storage policy enforced',
    description:
      'Removable storage is either blocked or write-audited per policy.',
    category: 'compliance',
    defaultSeverity: 'info',
    defaultScheduleMinutes: 1440,
    appliesTo: ALL_DESKTOP,
    hipaaControl: '164.310(d)(1)',
    defaultRunbookSlug: 'usb-policy',
  },

  // ─── Inventory ──────────────────────────────────────────────────────────
  {
    slug: 'software_inventory_delta',
    name: 'No unapproved software installed since last tick',
    description:
      'New packages installed since last heartbeat are on the approved list.',
    category: 'inventory',
    defaultSeverity: 'info',
    defaultScheduleMinutes: 360,
    appliesTo: ALL_DESKTOP,
    defaultRunbookSlug: 'unapproved-software',
  },
  {
    slug: 'hardware_change',
    name: 'No unauthorized hardware changes',
    description: 'No new disks, NICs, or PCI devices appeared since last tick.',
    category: 'inventory',
    defaultSeverity: 'info',
    defaultScheduleMinutes: 1440,
    appliesTo: ALL_DESKTOP,
    defaultRunbookSlug: 'hardware-change',
  },
  {
    slug: 'agent_binary_integrity',
    name: 'GITSOLS agent binary integrity',
    description:
      'Agent attests its on-disk SHA-256 matches the published release.',
    category: 'compliance',
    defaultSeverity: 'critical',
    defaultScheduleMinutes: 60,
    appliesTo: ALL_DESKTOP,
    defaultRunbookSlug: 'agent-tampered',
  },
]

export const NOC_CHECK_SLUGS = NOC_CHECK_CATALOG.map((c) => c.slug)

export function getNocCheck(
  slug: string,
): NocCheckDefinition | undefined {
  return NOC_CHECK_CATALOG.find((c) => c.slug === slug)
}

// ─── Default runbook seeds (titles only — body authored later) ────────────
//
// The implementation/troubleshooting guides for these slugs render in the
// admin runbook editor with a starter template per category. Listing them
// here means an admin can see what runbooks they're expected to author.

export const NOC_DEFAULT_RUNBOOKS: Array<{
  slug: string
  title: string
  category: NocCheckCategory
  audience: 'internal' | 'client_visible' | 'both'
}> = [
  { slug: 'enable-bitlocker', title: 'Enable BitLocker on a Windows endpoint', category: 'encryption', audience: 'internal' },
  { slug: 'enable-filevault', title: 'Enable FileVault on a Mac', category: 'encryption', audience: 'internal' },
  { slug: 'escrow-recovery-key', title: 'Escrow a recovery key into the GITSOLS vault', category: 'encryption', audience: 'internal' },
  { slug: 'os-patch-overdue', title: 'OS patches overdue — triage', category: 'patching', audience: 'both' },
  { slug: 'third-party-patch-overdue', title: 'Third-party app patches overdue', category: 'patching', audience: 'both' },
  { slug: 'reboot-pending', title: 'Reboot pending for more than 7 days', category: 'patching', audience: 'both' },
  { slug: 'disable-local-admin', title: 'Disable the built-in local admin account', category: 'identity', audience: 'internal' },
  { slug: 'password-rotation', title: 'Rotate aged interactive account passwords', category: 'identity', audience: 'internal' },
  { slug: 'enroll-mfa', title: 'Enroll a user in MFA', category: 'identity', audience: 'client_visible' },
  { slug: 'defender-not-running', title: 'Microsoft Defender not running', category: 'edr_av', audience: 'internal' },
  { slug: 'edr-agent-down', title: 'EDR agent (Huntress / SentinelOne) is down', category: 'edr_av', audience: 'internal' },
  { slug: 'signatures-stale', title: 'AV signatures are stale', category: 'edr_av', audience: 'internal' },
  { slug: 'full-scan-stale', title: 'Full AV scan has not run recently', category: 'edr_av', audience: 'internal' },
  { slug: 'backup-failed', title: 'Backup job failed', category: 'backup', audience: 'both' },
  { slug: 'backup-integrity', title: 'Backup integrity verification overdue', category: 'backup', audience: 'internal' },
  { slug: 'wan-unreachable', title: 'WAN unreachable from endpoint', category: 'network', audience: 'both' },
  { slug: 'dns-slow', title: 'DNS resolution slow / unhealthy', category: 'network', audience: 'internal' },
  { slug: 'vpn-down', title: 'Site VPN tunnel is down', category: 'network', audience: 'internal' },
  { slug: 'cert-expiring', title: 'TLS certificate expiring in less than 30 days', category: 'network', audience: 'internal' },
  { slug: 'lob-down', title: 'LOB application process is not running', category: 'lob_app', audience: 'both' },
  { slug: 'lob-port-closed', title: 'LOB application is not listening on its port', category: 'lob_app', audience: 'both' },
  { slug: 'log-forwarder-down', title: 'Audit log forwarder is not shipping', category: 'compliance', audience: 'internal' },
  { slug: 'screen-lock-policy', title: 'Idle screen lock policy out of compliance', category: 'compliance', audience: 'internal' },
  { slug: 'usb-policy', title: 'Removable storage policy out of compliance', category: 'compliance', audience: 'internal' },
  { slug: 'unapproved-software', title: 'Unapproved software detected on endpoint', category: 'inventory', audience: 'internal' },
  { slug: 'hardware-change', title: 'Unauthorized hardware change detected', category: 'inventory', audience: 'internal' },
  { slug: 'agent-tampered', title: 'GITSOLS agent binary integrity failed', category: 'compliance', audience: 'internal' },
]
