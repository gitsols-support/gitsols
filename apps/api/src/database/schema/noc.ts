// NOC (Network Operations Center) schema.
//
// Phase 2 — the heartbeat ingest pipeline + alerting + runbook system.
// See `noc-architecture.md` at the repo root for the design rationale.
//
// Conventions:
//   - Every row carries `clientId` (the Account UUID) so RLS partitions
//     by tenant. Internal staff bypass RLS via the `noc_staff` policy.
//   - Heartbeats, results, and alerts are append-only-ish: we never
//     UPDATE a heartbeat. Results have a `latest` flag for the live grid;
//     historical rows stay queryable.
//   - All timestamps are `withTimezone: true`. All durations are minutes.

import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// ─── Enums ────────────────────────────────────────────────────────────────

export const nocEndpointStatusEnum = pgEnum('noc_endpoint_status', [
  'healthy',
  'warning',
  'critical',
  'offline',
  'unenrolled',
])

export const nocEndpointKindEnum = pgEnum('noc_endpoint_kind', [
  'workstation',
  'server',
  'mobile',
  'network_device',
  'virtual',
  'other',
])

export const nocOsFamilyEnum = pgEnum('noc_os_family', [
  'windows',
  'macos',
  'linux',
  'ios',
  'android',
  'network_os',
  'unknown',
])

export const nocCheckSeverityEnum = pgEnum('noc_check_severity', [
  'info',
  'warn',
  'critical',
])

export const nocCheckCategoryEnum = pgEnum('noc_check_category', [
  'encryption',
  'patching',
  'identity',
  'edr_av',
  'backup',
  'network',
  'lob_app',
  'compliance',
  'inventory',
  'custom',
])

export const nocResultStatusEnum = pgEnum('noc_result_status', [
  'pass',
  'warn',
  'fail',
  'error',
  'skipped',
])

export const nocAlertStatusEnum = pgEnum('noc_alert_status', [
  'open',
  'acknowledged',
  'resolved',
  'suppressed',
])

export const nocRunbookAudienceEnum = pgEnum('noc_runbook_audience', [
  'internal',
  'client_visible',
  'both',
])

// ─── noc_endpoints — one row per managed device ───────────────────────────

export const nocEndpoints = pgTable(
  'noc_endpoints',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clientId: uuid('client_id').notNull(),

    // Identity
    hostname: text('hostname').notNull(),
    displayName: text('display_name'),
    serialNumber: text('serial_number'),
    fqdn: text('fqdn'),

    // Classification
    kind: nocEndpointKindEnum('kind').notNull().default('workstation'),
    osFamily: nocOsFamilyEnum('os_family').notNull().default('unknown'),
    osVersion: text('os_version'),

    // Crypto identity
    publicKey: text('public_key').notNull(),
    publicKeyFingerprint: text('public_key_fingerprint').notNull(),
    agentVersion: text('agent_version'),
    agentBinaryHash: text('agent_binary_hash'),

    // State
    status: nocEndpointStatusEnum('status').notNull().default('unenrolled'),
    lastHeartbeatAt: timestamp('last_heartbeat_at', { withTimezone: true }),
    lastIngressIp: text('last_ingress_ip'),

    // Lifecycle
    enrolledAt: timestamp('enrolled_at', { withTimezone: true }),
    decommissionedAt: timestamp('decommissioned_at', { withTimezone: true }),
    notes: text('notes'),
    tags: jsonb('tags').$type<string[]>().default([]),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index('noc_endpoints_client_idx').on(t.clientId),
    index('noc_endpoints_status_idx').on(t.status),
    index('noc_endpoints_last_heartbeat_idx').on(t.lastHeartbeatAt),
    uniqueIndex('noc_endpoints_fingerprint_idx').on(t.publicKeyFingerprint),
  ],
)

export type DbNocEndpoint = typeof nocEndpoints.$inferSelect
export type NewDbNocEndpoint = typeof nocEndpoints.$inferInsert

// ─── noc_enrollment_tokens — one-time install secrets ─────────────────────

export const nocEnrollmentTokens = pgTable(
  'noc_enrollment_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clientId: uuid('client_id').notNull(),

    // The token stored as SHA-256 hex — the cleartext is shown once at issuance.
    tokenHash: text('token_hash').notNull(),

    // Optional hint pre-binding the token to a specific device.
    intendedHostname: text('intended_hostname'),
    intendedKind: nocEndpointKindEnum('intended_kind'),

    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    consumedAt: timestamp('consumed_at', { withTimezone: true }),
    consumedByEndpointId: uuid('consumed_by_endpoint_id'),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: uuid('created_by'),
  },
  (t) => [
    index('noc_enroll_client_idx').on(t.clientId),
    uniqueIndex('noc_enroll_token_hash_idx').on(t.tokenHash),
    index('noc_enroll_expires_idx').on(t.expiresAt),
  ],
)

export type DbNocEnrollmentToken = typeof nocEnrollmentTokens.$inferSelect
export type NewDbNocEnrollmentToken = typeof nocEnrollmentTokens.$inferInsert

// ─── noc_check_definitions — global catalog of checks ─────────────────────

export const nocCheckDefinitions = pgTable(
  'noc_check_definitions',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    slug: text('slug').notNull(),
    name: text('name').notNull(),
    description: text('description').notNull(),

    category: nocCheckCategoryEnum('category').notNull(),
    defaultSeverity: nocCheckSeverityEnum('default_severity').notNull(),
    defaultScheduleMinutes: integer('default_schedule_minutes')
      .notNull()
      .default(60),

    // How the agent executes the check
    osquerySql: text('osquery_sql'),
    shellCommand: text('shell_command'),
    expectedExpression: text('expected_expression'),

    // Which OS families this check applies to
    appliesTo: jsonb('applies_to').$type<string[]>().notNull().default([]),

    // Optional control mapping (HIPAA, PCI, SOC2)
    hipaaControl: text('hipaa_control'),
    pciControl: text('pci_control'),
    socControl: text('soc_control'),

    defaultRunbookSlug: text('default_runbook_slug'),
    builtin: boolean('builtin').notNull().default(true),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex('noc_check_slug_idx').on(t.slug),
    index('noc_check_category_idx').on(t.category),
  ],
)

export type DbNocCheckDefinition = typeof nocCheckDefinitions.$inferSelect
export type NewDbNocCheckDefinition = typeof nocCheckDefinitions.$inferInsert

// ─── noc_client_configs — per-client check overrides ──────────────────────

export const nocClientConfigs = pgTable(
  'noc_client_configs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clientId: uuid('client_id').notNull(),
    checkDefinitionId: uuid('check_definition_id').notNull(),

    enabled: boolean('enabled').notNull().default(true),
    overrideSeverity: nocCheckSeverityEnum('override_severity'),
    overrideScheduleMinutes: integer('override_schedule_minutes'),
    thresholdOverrides: jsonb('threshold_overrides').$type<
      Record<string, unknown>
    >(),
    runbookSlug: text('runbook_slug'),

    // Optional scope — apply this override only to endpoints with these tags
    scopeTags: jsonb('scope_tags').$type<string[]>().default([]),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedBy: uuid('updated_by'),
  },
  (t) => [
    uniqueIndex('noc_client_config_uniq').on(t.clientId, t.checkDefinitionId),
    index('noc_client_config_client_idx').on(t.clientId),
  ],
)

export type DbNocClientConfig = typeof nocClientConfigs.$inferSelect
export type NewDbNocClientConfig = typeof nocClientConfigs.$inferInsert

// ─── noc_heartbeats — append-only ingest log ──────────────────────────────

export const nocHeartbeats = pgTable(
  'noc_heartbeats',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    endpointId: uuid('endpoint_id').notNull(),
    clientId: uuid('client_id').notNull(),

    receivedAt: timestamp('received_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    agentSentAt: timestamp('agent_sent_at', { withTimezone: true }).notNull(),

    agentVersion: text('agent_version').notNull(),
    agentBinaryHash: text('agent_binary_hash').notNull(),
    nonce: text('nonce').notNull(),

    signatureValid: boolean('signature_valid').notNull(),
    sourceIp: text('source_ip'),

    // Full payload — checks ran, system snapshot, anomalies
    payload: jsonb('payload')
      .$type<Record<string, unknown>>()
      .notNull(),
  },
  (t) => [
    index('noc_hb_endpoint_received_idx').on(t.endpointId, t.receivedAt),
    index('noc_hb_client_received_idx').on(t.clientId, t.receivedAt),
    uniqueIndex('noc_hb_nonce_idx').on(t.endpointId, t.nonce),
  ],
)

export type DbNocHeartbeat = typeof nocHeartbeats.$inferSelect
export type NewDbNocHeartbeat = typeof nocHeartbeats.$inferInsert

// ─── noc_endpoint_results — latest result per (endpoint, check) ───────────

export const nocEndpointResults = pgTable(
  'noc_endpoint_results',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    endpointId: uuid('endpoint_id').notNull(),
    clientId: uuid('client_id').notNull(),
    checkDefinitionId: uuid('check_definition_id').notNull(),

    status: nocResultStatusEnum('status').notNull(),
    severity: nocCheckSeverityEnum('severity').notNull(),
    observedAt: timestamp('observed_at', { withTimezone: true }).notNull(),

    value: jsonb('value').$type<Record<string, unknown>>(),
    message: text('message'),

    // Distinguish "latest" from historical — we keep historical for trend
    // but the live admin grid filters on isLatest = true.
    isLatest: boolean('is_latest').notNull().default(true),
  },
  (t) => [
    uniqueIndex('noc_result_latest_uniq')
      .on(t.endpointId, t.checkDefinitionId)
      .where(sql`is_latest = true`),
    index('noc_result_client_status_idx').on(t.clientId, t.status),
    index('noc_result_observed_idx').on(t.observedAt),
  ],
)

export type DbNocEndpointResult = typeof nocEndpointResults.$inferSelect
export type NewDbNocEndpointResult = typeof nocEndpointResults.$inferInsert

// ─── noc_alerts — opened when a result trips, linked to runbook ───────────

export const nocAlerts = pgTable(
  'noc_alerts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clientId: uuid('client_id').notNull(),
    endpointId: uuid('endpoint_id').notNull(),
    checkDefinitionId: uuid('check_definition_id').notNull(),

    severity: nocCheckSeverityEnum('severity').notNull(),
    status: nocAlertStatusEnum('status').notNull().default('open'),

    title: text('title').notNull(),
    summary: text('summary'),
    runbookSlug: text('runbook_slug'),

    openedAt: timestamp('opened_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    acknowledgedAt: timestamp('acknowledged_at', { withTimezone: true }),
    acknowledgedBy: uuid('acknowledged_by'),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    resolvedBy: uuid('resolved_by'),
    resolutionNote: text('resolution_note'),

    // For dedup — alerts on the same (endpoint, check) collapse while open.
    dedupKey: text('dedup_key').notNull(),
  },
  (t) => [
    index('noc_alert_client_status_idx').on(t.clientId, t.status),
    index('noc_alert_endpoint_idx').on(t.endpointId),
    index('noc_alert_opened_idx').on(t.openedAt),
    uniqueIndex('noc_alert_dedup_open_idx')
      .on(t.dedupKey)
      .where(sql`status = 'open'`),
  ],
)

export type DbNocAlert = typeof nocAlerts.$inferSelect
export type NewDbNocAlert = typeof nocAlerts.$inferInsert

// ─── noc_runbooks — markdown troubleshooting docs ─────────────────────────

export const nocRunbooks = pgTable(
  'noc_runbooks',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    slug: text('slug').notNull(),
    title: text('title').notNull(),
    summary: text('summary'),

    // Null = global default; set = client-specific override.
    clientId: uuid('client_id'),

    audience: nocRunbookAudienceEnum('audience').notNull().default('internal'),
    category: nocCheckCategoryEnum('category'),
    attachedTo: text('attached_to'), // optional check slug

    bodyMd: text('body_md').notNull(),
    currentVersion: integer('current_version').notNull().default(1),

    publishedAt: timestamp('published_at', { withTimezone: true }),
    archivedAt: timestamp('archived_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: uuid('created_by'),
  },
  (t) => [
    uniqueIndex('noc_runbook_slug_client_idx').on(t.slug, t.clientId),
    index('noc_runbook_client_idx').on(t.clientId),
    index('noc_runbook_attached_idx').on(t.attachedTo),
  ],
)

export type DbNocRunbook = typeof nocRunbooks.$inferSelect
export type NewDbNocRunbook = typeof nocRunbooks.$inferInsert

// ─── noc_runbook_versions — append-only edit history ─────────────────────

export const nocRunbookVersions = pgTable(
  'noc_runbook_versions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    runbookId: uuid('runbook_id').notNull(),

    version: integer('version').notNull(),
    bodyMd: text('body_md').notNull(),
    changeNote: text('change_note'),

    changedAt: timestamp('changed_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    changedBy: uuid('changed_by'),
  },
  (t) => [
    uniqueIndex('noc_runbook_version_uniq').on(t.runbookId, t.version),
    index('noc_runbook_version_changed_idx').on(t.changedAt),
  ],
)

export type DbNocRunbookVersion = typeof nocRunbookVersions.$inferSelect
export type NewDbNocRunbookVersion = typeof nocRunbookVersions.$inferInsert
