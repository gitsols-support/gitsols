// Config loader for the agent. Persists to a platform-appropriate path
// and reads on startup. Format is YAML for hand-editability during
// operator triage.

package config

import (
	"fmt"
	"os"
	"path/filepath"
	"runtime"

	"github.com/gitsols/noc-agent/pkg/types"
	"gopkg.in/yaml.v3"
)

type Config struct {
	EndpointID               string                  `yaml:"endpointId"`
	ClientID                 string                  `yaml:"clientId"`
	ServerURL                string                  `yaml:"serverUrl"`
	ServerPublicKey          string                  `yaml:"serverPublicKey"`
	HeartbeatIntervalMinutes int                     `yaml:"heartbeatIntervalMinutes"`
	Checks                   []types.ConfiguredCheck `yaml:"checks"`
}

// Path returns the canonical config file path for this OS.
func Path() string {
	if p := os.Getenv("GITSOLS_NOC_CONFIG"); p != "" {
		return p
	}
	switch runtime.GOOS {
	case "windows":
		return filepath.Join(os.Getenv("ProgramData"), "GITSOLS", "NOC", "agent.yaml")
	default:
		return "/etc/gitsols-noc/agent.yaml"
	}
}

func Load() (*Config, error) {
	data, err := os.ReadFile(Path())
	if err != nil {
		return nil, fmt.Errorf("read %s: %w", Path(), err)
	}
	var c Config
	if err := yaml.Unmarshal(data, &c); err != nil {
		return nil, fmt.Errorf("parse %s: %w", Path(), err)
	}
	if c.HeartbeatIntervalMinutes <= 0 {
		c.HeartbeatIntervalMinutes = 60
	}
	return &c, nil
}

func Save(c *Config) error {
	path := Path()
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}
	data, err := yaml.Marshal(c)
	if err != nil {
		return err
	}
	// Mode 0600 — config holds a server-issued endpointId. Not a secret in
	// the cryptographic sense (the private key lives in OS keystore) but
	// still restricted to root/admin.
	return os.WriteFile(path, data, 0o600)
}
