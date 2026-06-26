// First-run enrollment: exchange a one-time token for a long-lived
// endpoint identity + initial config.

package enrollment

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"runtime"
	"time"

	"github.com/gitsols/noc-agent/internal/config"
	"github.com/gitsols/noc-agent/internal/crypto"
	"github.com/gitsols/noc-agent/pkg/types"
)

type Options struct {
	ServerURL       string
	EnrollmentToken string
	Hostname        string
	AgentVersion    string
}

// Enroll generates a keypair, posts the enrollment request, persists the
// private key into the OS keystore, and returns the config to write.
func Enroll(ctx context.Context, opts Options) (*config.Config, error) {
	signer, err := crypto.GenerateSigner()
	if err != nil {
		return nil, fmt.Errorf("generate keypair: %w", err)
	}

	binHash, _ := crypto.SelfBinaryHash()
	body := types.EnrollmentRequest{
		EnrollmentToken:      opts.EnrollmentToken,
		PublicKey:            signer.PublicKeyB64(),
		PublicKeyFingerprint: signer.Fingerprint(),
		Hostname:             opts.Hostname,
		OSFamily:             osFamily(),
		OSVersion:            osVersion(),
		AgentVersion:         opts.AgentVersion,
		AgentBinaryHash:      binHash,
	}

	buf, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(
		ctx, http.MethodPost, opts.ServerURL+"/v1/noc/enroll", bytes.NewReader(buf),
	)
	if err != nil {
		return nil, err
	}
	req.Header.Set("content-type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("post: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("server rejected enrollment: %s", resp.Status)
	}

	var out types.EnrollmentResponse
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return nil, fmt.Errorf("decode response: %w", err)
	}

	// Persist the private key into the keystore.
	if err := crypto.PersistSigner(out.EndpointID, signer); err != nil {
		return nil, fmt.Errorf("persist key: %w", err)
	}

	return &config.Config{
		EndpointID:               out.EndpointID,
		ClientID:                 out.ClientID,
		ServerURL:                opts.ServerURL,
		ServerPublicKey:          out.ServerPublicKey,
		HeartbeatIntervalMinutes: out.Config.HeartbeatIntervalMinutes,
		Checks:                   out.Config.Checks,
	}, nil
}

func osFamily() string {
	switch runtime.GOOS {
	case "linux":
		return "linux"
	case "darwin":
		return "macos"
	case "windows":
		return "windows"
	default:
		return "unknown"
	}
}

func osVersion() string {
	// Phase 2: read from /etc/os-release on Linux, sw_vers on macOS,
	// HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion on Windows.
	return ""
}
