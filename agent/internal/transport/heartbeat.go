// Heartbeat transport — builds the payload, Ed25519-signs it, ships it.

package transport

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gitsols/noc-agent/internal/config"
	"github.com/gitsols/noc-agent/internal/crypto"
	"github.com/gitsols/noc-agent/pkg/types"
)

type Client struct {
	server  string
	signer  *crypto.Signer
	version string
	http    *http.Client
}

func NewClient(server string, signer *crypto.Signer, version string) *Client {
	return &Client{
		server:  server,
		signer:  signer,
		version: version,
		http: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// BuildHeartbeat assembles a `HeartbeatPayload` from the current config
// and the just-run check results.
func BuildHeartbeat(cfg *config.Config, agentVersion string, results []types.CheckResult) types.HeartbeatPayload {
	nonce := make([]byte, 16)
	_, _ = rand.Read(nonce)
	binHash, _ := crypto.SelfBinaryHash()
	return types.HeartbeatPayload{
		EndpointID:      cfg.EndpointID,
		AgentVersion:    agentVersion,
		AgentBinaryHash: binHash,
		SentAt:          time.Now().UTC().Format(time.RFC3339),
		Nonce:           hex.EncodeToString(nonce),
		Results:         results,
	}
}

// Send marshals, signs, and POSTs the heartbeat. Phase 2 adds the spool
// + retry on 5xx / network error.
func (c *Client) Send(ctx context.Context, hb types.HeartbeatPayload) error {
	body, err := json.Marshal(hb)
	if err != nil {
		return err
	}
	sig := c.signer.Sign(body)

	req, err := http.NewRequestWithContext(
		ctx, http.MethodPost, c.server+"/v1/noc/heartbeat", bytes.NewReader(body),
	)
	if err != nil {
		return err
	}
	req.Header.Set("content-type", "application/json")
	req.Header.Set("x-gitsols-signature", sig)
	req.Header.Set("user-agent", "gitsols-noc-agent/"+c.version)

	resp, err := c.http.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 400 {
		return fmt.Errorf("server returned %s", resp.Status)
	}
	return nil
}
