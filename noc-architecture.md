# GITSOLS NOC architecture

> Companion to `gitsols-platform-spec.md` and `gitsols-experience-spec.md`.
> This document describes the GITSOLS Network Operations Center: how it
> sees client systems, how clients see what the NOC sees, and what gets
> built vs. integrated.

## 1. What "the NOC" is, concretely

The NOC is three coordinated systems:

1. **The GITSOLS Agent** — a small, open-source-derived binary that runs on every endpoint we manage (Windows / macOS / Linux servers and workstations). It runs osquery under the hood, evaluates a per-client checklist hourly, and posts signed heartbeats to our ingest endpoint.
2. **The NOC ingest + alerting service** — a NestJS module on our API that authenticates, deduplicates, and stores heartbeats; evaluates alert rules; raises tickets; and exposes admin + portal read APIs.
3. **The NOC console** — a dedicated route group inside the admin shell where staff configure clients, write runbooks, triage alerts, and watch the live signal stream. A redacted view of the same data renders on the client portal.

Nothing here is gimmicky vapor. Every signal traces to an actual osquery row, an SNMP MIB OID, an M365 Graph endpoint, or a Datto/Veeam REST response. The marketing copy ("24/7 NOC monitoring") references measurable, auditable signals.

## 2. Open-source primitives we wrap

| Concern | Project | License | Why this and not custom |
|---|---|---|---|
| Endpoint query engine | **osquery** (Meta) | Apache 2.0 | 250+ SQL-queryable tables, cross-platform, battle-tested at FAANG scale |
| Endpoint orchestration (option B) | **Fleet** | MIT + paid tier | MDM + osquery orchestrator; we can self-host the OSS edition |
| SIEM / XDR (heavier path) | **Wazuh** | GPLv2 | Full SIEM + FIM + active response if we ever want one-stop |
| Network device monitoring | **LibreNMS** + SNMP / Telegraf | GPLv3 / MIT | SNMP polling and NetFlow without paying Auvik per device |
| Metrics shipping | **Telegraf** | MIT | Lightweight collector, 300+ input plugins |
| Time-series storage | **VictoriaMetrics** | Apache 2.0 | Prometheus-compatible, denser than InfluxDB, single binary |
| Log aggregation | **Loki** + **Vector** | AGPL / MPL 2.0 | Cheap log storage; Vector ships logs from edge |
| Multi-tenant M365 | **CIPP** | AGPL v3 | Free MSP-grade M365 multi-tenant console |
| Vulnerability scanner | **OpenVAS / Greenbone CE** | GPLv2 | Authenticated network vuln scans |
| Status page | **Statping-ng** | GPLv3 | Public status page per client |

For the first release we ship: osquery (via our wrapper agent) + Telegraf (for VM/host metrics) + CIPP (for M365). LibreNMS, Wazuh, OpenVAS are Phase 2.

## 3. The GITSOLS Agent (binary spec)

**Language:** Go 1.22+ (single static binary per OS, ~8 MB)
**Repo path:** `/agent/` at the monorepo root
**Distribution:** signed MSI (Windows), signed PKG (macOS), `.deb` + `.rpm` (Linux). Code-signing happens in CI with EV certs.

### What it does on each tick (default 60 minutes)

1. Reads `/etc/gitsols-noc/agent.yaml` (or `C:\ProgramData\GITSOLS\NOC\agent.yaml`) — server URL, client ID, agent ID, public-key pin, enabled check slugs, schedule overrides.
2. Asks the local osquery daemon (or spawns the osquery binary) for each enabled query.
3. Runs shell/system probes the catalog defines (`bitlocker_status`, `defender_health`, `last_patch_applied`, etc.).
4. Builds a `HeartbeatPayload`, hashes it, Ed25519-signs it with the per-endpoint private key.
5. POSTs to `https://api.gitsols.com/v1/noc/heartbeat` over TLS 1.3 with client-cert pinning.
6. On 200, updates the local last-success timestamp. On non-200, queues the heartbeat in a bounded SQLite spool (max 24h) and retries with exponential back-off.
7. Renders a tray icon (Phase 2 — see §8) with green/yellow/red status.

### What it does NOT do

- Never reads file contents. Only metadata (path, size, ACL, hash).
- Never opens listening sockets. Outbound-only.
- Never executes commands pushed from the server. Remediation is gated behind a separate signed, role-scoped channel that does not ship in v1.
- Never collects PHI/PII strings. EMR session metadata only: "process X listening on port Y since T".

### First-run enrollment

1. Installer prompts for a 16-char one-time enrollment token (issued by admin via `/admin/noc/clients/[id]/enroll`).
2. Agent generates an Ed25519 keypair on the device, attests the binary's own SHA-256.
3. Agent POSTs `{ enrollmentToken, publicKey, hostname, os, binaryHash }` to `/v1/noc/enroll`.
4. Server validates the token (single-use, 60-min TTL), creates the `noc_endpoints` row, returns the assigned `endpointId` and the server's signing key for response verification.
5. Agent persists config; the enrollment token is invalidated.

## 4. Data plane — schema overview

(Full DDL lives in `apps/api/src/database/schema/noc.ts`.)

```
noc_endpoints           one per managed device
noc_enrollment_tokens   one-time bootstrap secrets
noc_heartbeats          append-only, one row per agent post
noc_check_definitions   the global catalog (~30 seeded checks)
noc_client_configs      which checks are enabled for which client
noc_endpoint_results    latest result per (endpoint, check) — the live grid
noc_alerts              open + historical alerts, linked to runbooks
noc_runbooks            markdown troubleshooting docs (global + per-client)
noc_runbook_versions    append-only edit history
```

All `noc_*` tables carry `client_id` for RLS partitioning. Heartbeats and results retain for 13 months (HIPAA min 6 yrs lives in cold archive).

## 5. Check catalog (seed)

30 built-in checks ship in `packages/constants/src/noc.ts`. Organized by category:

- **encryption** — BitLocker/FileVault on, LUKS on, recovery key escrowed
- **patching** — OS patch lag (days), 3rd-party app patch lag, reboot pending
- **identity** — MFA enrollment %, local admin disabled, password age, break-glass account aged
- **edr_av** — Defender / EDR running, signatures fresh, last full scan < N days
- **backup** — last successful backup < 24h, integrity test passed, RPO/RTO
- **network** — VPN tunnel up, DNS resolution baseline, WAN reachability, cert expiry
- **lob_app** — process X is listening on port Y, vendor-specific health URL responds
- **compliance** — HIPAA audit log forwarder running, log retention configured, FIPS mode
- **inventory** — software inventory delta, hardware change, USB device policy

Each check defines: slug, name, category, severity, osquery SQL (or shell command), expected condition, default schedule, default runbook slug, and HIPAA control mapping where applicable.

## 6. Per-client configurator

`/admin/noc/clients/[id]/configurator` lets staff:

- Enable/disable any check for the client
- Override default severity (e.g., backup failure = critical for healthcare clients, warn for marketing-only clients)
- Override threshold (e.g., patch lag tolerance 30 days for legacy environment)
- Override schedule (run every 15 min instead of 60)
- Attach a runbook to a check
- Add custom YAML-defined checks unique to this client (e.g., "is the PMA Practice Management service up on the EHR server")

Saves to `noc_client_configs`. The agent's next heartbeat pulls the updated config.

## 7. Runbook system

Runbooks live in `noc_runbooks` as markdown bodies. Versioned (append-only). Each runbook has:

- `slug`, `title`, `body_md`, `audience` (internal / client-visible / both)
- `category` (matches check category) or `attachedTo` (specific check slug)
- `client_id` nullable — null = global default, set = client-specific override

Editor in `/admin/noc/runbooks/[slug]/edit` is plain markdown + live preview. Client-visible runbooks render in `/portal/noc/runbooks` (redacted: vendor names and internal access paths get auto-stripped via a markdown transformer).

## 8. Tray icon (Phase 2 scope)

Linux: minimal AppIndicator / libayatana-indicator.
macOS: Cocoa NSStatusItem (signed pkg).
Windows: System Tray icon via NotifyIcon / WinUI 3.

UI states: green (all checks pass), amber (warnings present), red (critical or offline > 2 ticks). Right-click menu: "Open client portal", "Last check", "Run check now", "Help / call NOC".

Out of scope for v1 — the agent ships headless in v1 with the tray as a Phase 2 wrapper. The wrapper's Go code lives at `agent/internal/tray/` and stubs out today.

## 9. Security model

- **Transport:** TLS 1.3, public key pin per environment (production / staging differ).
- **Identity:** per-endpoint Ed25519 keypair, generated on device, never transmitted.
- **Authentication:** every heartbeat signed; server rejects unsigned or replay (nonce + timestamp ±5min window).
- **Authorization:** server-side, `client_id` derived from the endpoint's certificate, never from the request body.
- **Audit:** every heartbeat, every config change, every alert ack appended to `audit_log` with actor + before/after.
- **Secrets:** no secrets in the agent's config file. Bootstrap token is single-use. Enrollment exchanges it for a long-lived endpoint cert held in OS keystore (DPAPI on Windows, Keychain on macOS, libsecret on Linux).
- **PHI:** agent never reads file contents. Vendor BAAs cover us for Microsoft, Postmark, Datto, Cloudflare, AWS (where used).
- **Tamper-evidence:** agent attests its own binary hash on every heartbeat. Server logs `agent_binary_hash` mismatch as a critical alert.

## 10. Client portal NOC view

At `/portal/noc` an authenticated client user sees:

- Their fleet rollup (X endpoints, Y healthy, Z with warnings, W critical)
- A grid of their endpoints with last-check time and status
- An alert feed (redacted — no vendor names, no internal IPs unless their own)
- Their assigned runbooks (the client-visible ones)
- A "Talk to NOC" CTA → opens a ticket linked to the device

Clients cannot edit checks or runbooks — that's admin-only.

## 11. Rollout phases

- **v1 (this PR)** — Schema, ingest API, signature verification, admin dashboard + configurator + runbook editor, client portal stub, headless Go agent that completes the heartbeat loop on osquery-installed endpoints.
- **v1.1** — Tray icon native code on all three platforms, signed installers, deployment scripts (Intune, JAMF, Ansible).
- **v1.2** — Network device monitoring via LibreNMS + Telegraf SNMP plugin.
- **v1.3** — M365 / Google Workspace tenant signals via CIPP integration.
- **v2** — Backup orchestration integrations (Datto, Veeam), vuln scanning ingestion (OpenVAS), public status page per client.

## 12. What this gives the business

A defensible answer when a prospect asks "how do you actually know my stuff is healthy?" — open the `/admin/noc` console with them and walk through the live grid for any client. A 24/7 monitoring claim that traces to a measurable signal and a control mapping. A client-portal differentiator that no commodity break-fix shop will match. A roadmap that ladders into MDM, SIEM, and compliance attestation without throwing this work away.
