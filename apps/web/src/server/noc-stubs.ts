// NOC stub data — paints the admin console + bell while the Phase 2 API
// wiring lands. Replace each call site with `fetch('/api/v1/noc/admin/…')`
// during integration; the shapes here mirror the Nest controller responses.

import type {
  NocAlertSummary,
  NocCheckCategory,
  NocCheckSeverity,
  NocEndpointSummary,
  NocFleetRollup,
  NocRunbookSummary,
} from '@gitsols/types'

// ─── Tenants (clients) ────────────────────────────────────────────────────

export interface NocClientStub {
  id: string
  name: string
  industry: string
  endpointCount: number
  status: 'healthy' | 'warning' | 'critical' | 'offline'
}

export const NOC_CLIENTS: NocClientStub[] = [
  { id: 'c_001', name: 'Riverside Medical Group', industry: 'healthcare', endpointCount: 18, status: 'warning' },
  { id: 'c_002', name: 'Edgewater Capital', industry: 'financial-services', endpointCount: 22, status: 'healthy' },
  { id: 'c_003', name: 'Bayshore Dental Partners', industry: 'healthcare', endpointCount: 11, status: 'critical' },
  { id: 'c_004', name: 'Hudson Architects', industry: 'professional-services', endpointCount: 7, status: 'healthy' },
  { id: 'c_005', name: 'Cape May Wealth Advisors', industry: 'financial-services', endpointCount: 9, status: 'healthy' },
]

// ─── Rollup ───────────────────────────────────────────────────────────────

export const NOC_ROLLUP: NocFleetRollup = {
  total: NOC_CLIENTS.reduce((s, c) => s + c.endpointCount, 0),
  healthy: 47,
  warning: 12,
  critical: 4,
  offline: 4,
  openAlerts: 7,
  lastHeartbeatAt: new Date(Date.now() - 38_000).toISOString(),
}

// ─── Alert feed (extends NocAlertSummary with display-only client name) ──

export interface NocAlertFeedItem extends NocAlertSummary {
  clientName: string
  timeAgo: string
}

function ago(min: number): string {
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export const NOC_ALERT_FEED: NocAlertFeedItem[] = [
  {
    id: 'al_001',
    clientId: 'c_003',
    clientName: 'Bayshore Dental',
    endpointId: 'ep_001',
    endpointHostname: 'BAY-RECEPT-04',
    checkSlug: 'backup_last_success_24h',
    severity: 'critical',
    status: 'open',
    title: 'Backup has not succeeded in 36 hours',
    summary: 'Datto agent reports last successful job 36h ago. Cloud sync is current; local copy stalled.',
    runbookSlug: 'backup-failed',
    openedAt: new Date(Date.now() - 22 * 60_000).toISOString(),
    timeAgo: ago(22),
  },
  {
    id: 'al_002',
    clientId: 'c_001',
    clientName: 'Riverside Medical',
    endpointId: 'ep_002',
    endpointHostname: 'RVR-NUR-02',
    checkSlug: 'defender_running',
    severity: 'critical',
    status: 'open',
    title: 'Microsoft Defender real-time protection is off',
    summary: 'Detected at 10:18 ET. Last known good state 8 hours prior.',
    runbookSlug: 'defender-not-running',
    openedAt: new Date(Date.now() - 64 * 60_000).toISOString(),
    timeAgo: ago(64),
  },
  {
    id: 'al_003',
    clientId: 'c_001',
    clientName: 'Riverside Medical',
    endpointId: 'ep_003',
    endpointHostname: 'RVR-SRV-EMR',
    checkSlug: 'lob_port_listening',
    severity: 'critical',
    status: 'open',
    title: 'EMR application not listening on port 443',
    summary: 'Process is running but the listener has not bound. PMA Practice Management restart likely.',
    runbookSlug: 'lob-port-closed',
    openedAt: new Date(Date.now() - 95 * 60_000).toISOString(),
    timeAgo: ago(95),
  },
  {
    id: 'al_004',
    clientId: 'c_002',
    clientName: 'Edgewater Capital',
    endpointId: 'ep_004',
    endpointHostname: 'EDG-TRADER-12',
    checkSlug: 'os_patch_lag_30d',
    severity: 'warn',
    status: 'open',
    title: 'OS patches 43 days behind',
    summary: 'May cumulative not yet applied. Maintenance window scheduled Sat 2am.',
    runbookSlug: 'os-patch-overdue',
    openedAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
    timeAgo: ago(180),
  },
  {
    id: 'al_005',
    clientId: 'c_004',
    clientName: 'Hudson Architects',
    endpointId: 'ep_005',
    endpointHostname: 'HUD-CAD-03',
    checkSlug: 'cert_expiry_30d',
    severity: 'warn',
    status: 'open',
    title: 'TLS cert on intranet expires in 21 days',
    summary: 'cad.hudson.local — Let’s Encrypt renewal hook last failed 6 days ago.',
    runbookSlug: 'cert-expiring',
    openedAt: new Date(Date.now() - 6 * 3600_000).toISOString(),
    timeAgo: ago(360),
  },
  {
    id: 'al_006',
    clientId: 'c_005',
    clientName: 'Cape May Wealth',
    endpointId: 'ep_006',
    endpointHostname: 'CMW-RECEPT-01',
    checkSlug: 'signatures_fresh_24h',
    severity: 'warn',
    status: 'open',
    title: 'AV signatures last updated 38h ago',
    summary: 'Endpoint failed to reach update server twice. WAN check passing — likely vendor side.',
    runbookSlug: 'signatures-stale',
    openedAt: new Date(Date.now() - 9 * 3600_000).toISOString(),
    timeAgo: ago(540),
  },
  {
    id: 'al_007',
    clientId: 'c_001',
    clientName: 'Riverside Medical',
    endpointId: 'ep_007',
    endpointHostname: 'RVR-FW-01',
    checkSlug: 'vpn_tunnel_up',
    severity: 'warn',
    status: 'open',
    title: 'Site VPN tunnel flapping',
    summary: '3 flaps in the last hour on the secondary tunnel. Primary healthy.',
    runbookSlug: 'vpn-down',
    openedAt: new Date(Date.now() - 12 * 3600_000).toISOString(),
    timeAgo: ago(720),
  },
]

// ─── Endpoint grid ────────────────────────────────────────────────────────

export interface NocEndpointGridItem extends NocEndpointSummary {
  clientName: string
}

export const NOC_ENDPOINTS: NocEndpointGridItem[] = [
  {
    id: 'ep_001', clientId: 'c_003', clientName: 'Bayshore Dental',
    hostname: 'BAY-RECEPT-04', kind: 'workstation', osFamily: 'windows', osVersion: '11 23H2',
    status: 'critical', lastHeartbeatAt: new Date(Date.now() - 5 * 60_000).toISOString(),
    passCount: 22, warnCount: 1, failCount: 1, agentVersion: '0.2.0', tags: ['reception', 'pma'],
  },
  {
    id: 'ep_002', clientId: 'c_001', clientName: 'Riverside Medical',
    hostname: 'RVR-NUR-02', kind: 'workstation', osFamily: 'windows', osVersion: '11 23H2',
    status: 'critical', lastHeartbeatAt: new Date(Date.now() - 8 * 60_000).toISOString(),
    passCount: 21, warnCount: 1, failCount: 2, agentVersion: '0.2.0', tags: ['phi', 'nursing-floor'],
  },
  {
    id: 'ep_003', clientId: 'c_001', clientName: 'Riverside Medical',
    hostname: 'RVR-SRV-EMR', kind: 'server', osFamily: 'windows', osVersion: 'Server 2022',
    status: 'critical', lastHeartbeatAt: new Date(Date.now() - 12 * 60_000).toISOString(),
    passCount: 19, warnCount: 2, failCount: 2, agentVersion: '0.2.0', tags: ['phi', 'emr', 'production'],
  },
  {
    id: 'ep_004', clientId: 'c_002', clientName: 'Edgewater Capital',
    hostname: 'EDG-TRADER-12', kind: 'workstation', osFamily: 'windows', osVersion: '11 22H2',
    status: 'warning', lastHeartbeatAt: new Date(Date.now() - 2 * 60_000).toISOString(),
    passCount: 22, warnCount: 1, failCount: 0, agentVersion: '0.2.0', tags: ['trading-floor'],
  },
  {
    id: 'ep_005', clientId: 'c_004', clientName: 'Hudson Architects',
    hostname: 'HUD-CAD-03', kind: 'workstation', osFamily: 'windows', osVersion: '11 23H2',
    status: 'warning', lastHeartbeatAt: new Date(Date.now() - 4 * 60_000).toISOString(),
    passCount: 23, warnCount: 1, failCount: 0, agentVersion: '0.2.0', tags: ['cad'],
  },
  {
    id: 'ep_006', clientId: 'c_005', clientName: 'Cape May Wealth',
    hostname: 'CMW-RECEPT-01', kind: 'workstation', osFamily: 'macos', osVersion: '14.5',
    status: 'warning', lastHeartbeatAt: new Date(Date.now() - 6 * 60_000).toISOString(),
    passCount: 22, warnCount: 1, failCount: 0, agentVersion: '0.2.0', tags: ['reception'],
  },
  {
    id: 'ep_007', clientId: 'c_001', clientName: 'Riverside Medical',
    hostname: 'RVR-FW-01', kind: 'network_device', osFamily: 'network_os', osVersion: 'FortiOS 7.4',
    status: 'warning', lastHeartbeatAt: new Date(Date.now() - 90_000).toISOString(),
    passCount: 18, warnCount: 1, failCount: 0, agentVersion: '0.2.0', tags: ['firewall'],
  },
  {
    id: 'ep_008', clientId: 'c_002', clientName: 'Edgewater Capital',
    hostname: 'EDG-SRV-FILE', kind: 'server', osFamily: 'windows', osVersion: 'Server 2022',
    status: 'healthy', lastHeartbeatAt: new Date(Date.now() - 30_000).toISOString(),
    passCount: 25, warnCount: 0, failCount: 0, agentVersion: '0.2.0', tags: ['production'],
  },
]

// ─── Runbook library (stub) ───────────────────────────────────────────────

export const NOC_RUNBOOK_LIBRARY: NocRunbookSummary[] = [
  { id: 'rb_001', slug: 'backup-failed', title: 'Backup job failed', summary: 'Triage steps for any failed daily backup.', audience: 'both', category: 'backup' as NocCheckCategory, currentVersion: 4, updatedAt: new Date(Date.now() - 2 * 86400_000).toISOString() },
  { id: 'rb_002', slug: 'defender-not-running', title: 'Microsoft Defender not running', summary: 'Steps when Defender real-time protection has stopped.', audience: 'internal', category: 'edr_av', currentVersion: 7, updatedAt: new Date(Date.now() - 5 * 86400_000).toISOString() },
  { id: 'rb_003', slug: 'lob-port-closed', title: 'LOB application is not listening on its port', summary: 'EHR / PMS / LOB port closed — restart sequence.', audience: 'internal', category: 'lob_app', currentVersion: 3, updatedAt: new Date(Date.now() - 9 * 86400_000).toISOString() },
  { id: 'rb_004', slug: 'enroll-mfa', title: 'Enroll a user in MFA', summary: 'Client-facing self-serve walkthrough.', audience: 'client_visible', category: 'identity', currentVersion: 2, updatedAt: new Date(Date.now() - 14 * 86400_000).toISOString() },
  { id: 'rb_005', slug: 'wan-unreachable', title: 'WAN unreachable from endpoint', summary: 'Single-endpoint vs site-wide outage triage.', audience: 'both', category: 'network', currentVersion: 6, updatedAt: new Date(Date.now() - 21 * 86400_000).toISOString() },
  { id: 'rb_006', slug: 'os-patch-overdue', title: 'OS patches overdue — triage', summary: 'When auto-patch fails or has been deferred.', audience: 'both', category: 'patching', currentVersion: 8, updatedAt: new Date(Date.now() - 28 * 86400_000).toISOString() },
]

// ─── Severity → tone color helpers ────────────────────────────────────────

export function severityTone(s: NocCheckSeverity): 'good' | 'warn' | 'bad' {
  return s === 'critical' ? 'bad' : s === 'warn' ? 'warn' : 'good'
}
