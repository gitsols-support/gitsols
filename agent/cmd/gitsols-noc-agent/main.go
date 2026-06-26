// gitsols-noc-agent — entrypoint.
//
// Subcommands:
//   enroll  --token <token>   First-run enrollment with a one-time token.
//   run     [--once]          Run the heartbeat loop (or once, for cron).
//   status                    Print current config + last heartbeat.
//   version                   Print version + binary SHA-256.

package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gitsols/noc-agent/internal/checks"
	"github.com/gitsols/noc-agent/internal/config"
	"github.com/gitsols/noc-agent/internal/crypto"
	"github.com/gitsols/noc-agent/internal/enrollment"
	"github.com/gitsols/noc-agent/internal/transport"
)

// Set at build time via -ldflags.
var version = "dev"

func main() {
	if len(os.Args) < 2 {
		usage()
		os.Exit(2)
	}

	switch os.Args[1] {
	case "enroll":
		runEnroll(os.Args[2:])
	case "run":
		runLoop(os.Args[2:])
	case "status":
		runStatus()
	case "version", "-v", "--version":
		fmt.Printf("gitsols-noc-agent %s\n", version)
		sum, _ := crypto.SelfBinaryHash()
		fmt.Printf("binary sha256: %s\n", sum)
	default:
		usage()
		os.Exit(2)
	}
}

func usage() {
	fmt.Fprintf(os.Stderr, `gitsols-noc-agent — GITSOLS NOC monitoring agent

Usage:
  gitsols-noc-agent enroll --token <one-time-token> [--server <url>]
  gitsols-noc-agent run [--once]
  gitsols-noc-agent status
  gitsols-noc-agent version
`)
}

// ─── enroll ───────────────────────────────────────────────────────────────

func runEnroll(args []string) {
	fs := flag.NewFlagSet("enroll", flag.ExitOnError)
	token := fs.String("token", "", "one-time enrollment token")
	server := fs.String("server", "https://api.gitsols.com", "NOC ingest base URL")
	hostname, _ := os.Hostname()
	host := fs.String("hostname", hostname, "reported hostname")
	_ = fs.Parse(args)

	if *token == "" {
		fmt.Fprintln(os.Stderr, "missing --token")
		os.Exit(2)
	}

	cfg, err := enrollment.Enroll(context.Background(), enrollment.Options{
		ServerURL:        *server,
		EnrollmentToken:  *token,
		Hostname:         *host,
		AgentVersion:     version,
	})
	if err != nil {
		fmt.Fprintf(os.Stderr, "enrollment failed: %v\n", err)
		os.Exit(1)
	}
	if err := config.Save(cfg); err != nil {
		fmt.Fprintf(os.Stderr, "saving config failed: %v\n", err)
		os.Exit(1)
	}
	fmt.Printf("enrolled · endpoint %s · client %s\n", cfg.EndpointID, cfg.ClientID)
}

// ─── run ──────────────────────────────────────────────────────────────────

func runLoop(args []string) {
	fs := flag.NewFlagSet("run", flag.ExitOnError)
	once := fs.Bool("once", false, "single tick then exit (cron use)")
	_ = fs.Parse(args)

	cfg, err := config.Load()
	if err != nil {
		fmt.Fprintf(os.Stderr, "config load failed: %v\nrun: gitsols-noc-agent enroll --token <…>\n", err)
		os.Exit(1)
	}

	signer, err := crypto.OpenSigner(cfg.EndpointID)
	if err != nil {
		fmt.Fprintf(os.Stderr, "signing key load failed: %v\n", err)
		os.Exit(1)
	}

	runner := checks.NewRunner(cfg)
	client := transport.NewClient(cfg.ServerURL, signer, version)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		<-sig
		cancel()
	}()

	tick := func() {
		results := runner.RunAll(ctx)
		hb := transport.BuildHeartbeat(cfg, version, results)
		if err := client.Send(ctx, hb); err != nil {
			fmt.Fprintf(os.Stderr, "heartbeat failed: %v\n", err)
		}
	}

	tick()
	if *once {
		return
	}

	interval := time.Duration(cfg.HeartbeatIntervalMinutes) * time.Minute
	if interval < time.Minute {
		interval = 60 * time.Minute
	}
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			tick()
		}
	}
}

// ─── status ───────────────────────────────────────────────────────────────

func runStatus() {
	cfg, err := config.Load()
	if err != nil {
		fmt.Fprintf(os.Stderr, "not enrolled (%v)\n", err)
		os.Exit(1)
	}
	fmt.Printf("endpoint:        %s\n", cfg.EndpointID)
	fmt.Printf("client:          %s\n", cfg.ClientID)
	fmt.Printf("server:          %s\n", cfg.ServerURL)
	fmt.Printf("heartbeat every: %d min\n", cfg.HeartbeatIntervalMinutes)
	fmt.Printf("enabled checks:  %d\n", len(cfg.Checks))
}
