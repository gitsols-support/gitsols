// Ed25519 signing primitives + the OS-keystore handoff.
//
// Phase 2 wires the OS-native keystores (DPAPI on Windows, Keychain on
// macOS, libsecret/keyring on Linux) via build-tagged files. v0.2.0
// keeps a single in-memory implementation that reads the private key
// from a 0600 file at a known path — clearly marked for replacement.

package crypto

import (
	"crypto/ed25519"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"os"
	"path/filepath"
	"runtime"
)

type Signer struct {
	priv ed25519.PrivateKey
	pub  ed25519.PublicKey
}

func (s *Signer) Sign(message []byte) string {
	sig := ed25519.Sign(s.priv, message)
	return base64.RawURLEncoding.EncodeToString(sig)
}

func (s *Signer) PublicKeyB64() string {
	return base64.RawURLEncoding.EncodeToString(s.pub)
}

func (s *Signer) Fingerprint() string {
	sum := sha256.Sum256(s.pub)
	return hex.EncodeToString(sum[:])
}

// GenerateSigner creates a new keypair (used during enrollment).
func GenerateSigner() (*Signer, error) {
	pub, priv, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		return nil, err
	}
	return &Signer{priv: priv, pub: pub}, nil
}

// PersistSigner writes the keypair to the keystore. Phase 2 will swap
// the file-on-disk fallback for an OS-keystore call.
func PersistSigner(endpointID string, s *Signer) error {
	dir, err := keyDir()
	if err != nil {
		return err
	}
	if err := os.MkdirAll(dir, 0o700); err != nil {
		return err
	}
	path := filepath.Join(dir, endpointID+".key")
	return os.WriteFile(path, s.priv, 0o600)
}

// OpenSigner reads the keypair for an endpoint.
func OpenSigner(endpointID string) (*Signer, error) {
	dir, err := keyDir()
	if err != nil {
		return nil, err
	}
	path := filepath.Join(dir, endpointID+".key")
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("read key: %w", err)
	}
	if len(data) != ed25519.PrivateKeySize {
		return nil, fmt.Errorf("bad key length: %d", len(data))
	}
	priv := ed25519.PrivateKey(data)
	pub := priv.Public().(ed25519.PublicKey)
	return &Signer{priv: priv, pub: pub}, nil
}

// SelfBinaryHash returns the SHA-256 of the running binary — used in
// tamper-evidence attestations on every heartbeat.
func SelfBinaryHash() (string, error) {
	exe, err := os.Executable()
	if err != nil {
		return "", err
	}
	data, err := os.ReadFile(exe)
	if err != nil {
		return "", err
	}
	sum := sha256.Sum256(data)
	return hex.EncodeToString(sum[:]), nil
}

func keyDir() (string, error) {
	switch runtime.GOOS {
	case "windows":
		return filepath.Join(os.Getenv("ProgramData"), "GITSOLS", "NOC", "keys"), nil
	default:
		return "/var/lib/gitsols-noc/keys", nil
	}
}
