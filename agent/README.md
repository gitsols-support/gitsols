# GITSOLS NOC Agent

Open-source-derived, signed-and-shipped monitoring agent for endpoints
under GITSOLS management. Cross-platform Go binary that wraps **osquery**
and pushes signed heartbeats to the GITSOLS NOC every 60 minutes.

## Why a custom wrapper around osquery

osquery (Apache 2.0, Meta) gives us 250+ SQL-queryable tables across
Windows / macOS / Linux. We don't reinvent it. We wrap it because:

- We need a single signed binary that includes the heartbeat client,
  the YAML check loader, the spool/retry queue, and the Ed25519 signing
  layer — features osquery itself doesn't ship.
- We want the binary to carry GITSOLS branding, code signature, and
  attest its own SHA-256 to detect tamper.
- We want a single OS-native installer (MSI / PKG / DEB / RPM) per
  release with a known good config baseline.

## What it does on each tick

1. Reads `/etc/gitsols-noc/agent.yaml` (Linux/macOS) or
   `C:\ProgramData\GITSOLS\NOC\agent.yaml` (Windows).
2. For each enabled check, runs the osquery SQL or shell command from
   the catalog.
3. Builds a `HeartbeatPayload` (see `pkg/types/heartbeat.go`).
4. Signs the canonical JSON with Ed25519, ships to
   `https://api.gitsols.com/v1/noc/heartbeat`.
5. On 5xx or network failure, spools to a bounded SQLite queue (24h
   max) and retries with exponential backoff.

## First-run enrollment

```
gitsols-noc-agent enroll --token <one-time-token>
```

The agent generates an Ed25519 keypair (private key escrowed in
the OS keystore — DPAPI / Keychain / libsecret), posts the public key
plus host metadata to `/v1/noc/enroll`, and persists the returned
`endpointId` + initial config to `agent.yaml`.

## Build

```
make build           # native
make build-all       # cross-compile windows/macos/linux × amd64/arm64
make install         # local install (development)
make package         # generate signed installers (CI)
```

Requires Go 1.22+.

## Layout

```
agent/
├── README.md
├── Makefile
├── go.mod / go.sum
├── cmd/
│   └── gitsols-noc-agent/
│       └── main.go           # entrypoint, flag parsing
├── pkg/
│   └── types/
│       └── heartbeat.go      # wire types (mirror @gitsols/types)
└── internal/
    ├── config/
    │   └── config.go         # YAML loader, defaults, validation
    ├── enrollment/
    │   └── enrollment.go     # POST /v1/noc/enroll, keystore handoff
    ├── checks/
    │   ├── runner.go         # interface + osquery + shell impls
    │   └── catalog.go        # check slug → command mapping
    ├── transport/
    │   └── heartbeat.go      # signed POST + retry + spool
    ├── crypto/
    │   └── signer.go         # Ed25519 sign/verify wrappers
    ├── spool/
    │   └── spool.go          # bounded SQLite outbox
    └── tray/
        └── tray.go           # Phase 2 — native tray icon stubs
```

## Security model

See `../noc-architecture.md` §9 for the full model. tl;dr:

- TLS 1.3 + server cert pin per environment
- Per-endpoint Ed25519 keypair, generated on device, never transmitted
- Replay protection via nonce + `sentAt` window
- Agent attests its own SHA-256 on every heartbeat
- No PHI — agent ships metadata, never content
- OS keystore for the private key

## Phase

v0.2.0 (this repo) — heartbeat loop, enrollment, osquery wrapper.
v0.3.0 — cross-platform tray icon, signed installers.
v0.4.0 — log shipping (Vector) + network device monitoring (SNMP).
