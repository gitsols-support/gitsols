// Phase 2 — native tray icon.
//
// This file is the stub. Real cross-platform tray support pulls in
// build-tagged implementations:
//
//   internal/tray/tray_darwin.go    NSStatusItem via Cocoa cgo bindings
//   internal/tray/tray_windows.go   NotifyIcon via winapi
//   internal/tray/tray_linux.go     AppIndicator via libayatana-indicator
//
// For v0.2.0 (headless) the agent ships without a tray UI. The wrapper
// scripts that install the agent register it as a system service so an
// admin can still see its status via `systemctl` / Services.msc.

package tray

// Status is the current rolled-up state we'd render in the tray.
type Status int

const (
	StatusUnknown Status = iota
	StatusHealthy
	StatusWarning
	StatusCritical
	StatusOffline
)

// Start renders the tray icon (no-op in v0.2.0).
func Start(_ Status) error {
	return nil
}

// Update sets the tray status (no-op in v0.2.0).
func Update(_ Status) {}
