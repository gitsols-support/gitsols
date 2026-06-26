// Wire types for the heartbeat protocol. Mirrors @gitsols/types `Noc*`
// interfaces. Keep in sync — changes here require a matching change in
// packages/types/src/index.ts.

package types

// HeartbeatPayload is the JSON body of POST /v1/noc/heartbeat.
type HeartbeatPayload struct {
	EndpointID      string          `json:"endpointId"`
	AgentVersion    string          `json:"agentVersion"`
	AgentBinaryHash string          `json:"agentBinaryHash"`
	SentAt          string          `json:"sentAt"`
	Nonce           string          `json:"nonce"`
	Results         []CheckResult   `json:"results"`
	Snapshot        *SystemSnapshot `json:"snapshot,omitempty"`
}

type CheckResult struct {
	CheckSlug  string                 `json:"checkSlug"`
	Status     string                 `json:"status"` // pass | warn | fail | error | skipped
	Value      map[string]any         `json:"value,omitempty"`
	Message    string                 `json:"message,omitempty"`
	DurationMs int64                  `json:"durationMs,omitempty"`
	_          struct{}               `json:"-"`
}

type SystemSnapshot struct {
	Hostname         string  `json:"hostname"`
	FQDN             string  `json:"fqdn,omitempty"`
	OSFamily         string  `json:"osFamily"`
	OSVersion        string  `json:"osVersion,omitempty"`
	CPUPct           float64 `json:"cpuPct,omitempty"`
	MemTotalMB       int64   `json:"memTotalMb,omitempty"`
	MemUsedMB        int64   `json:"memUsedMb,omitempty"`
	DiskTotalGB      float64 `json:"diskTotalGb,omitempty"`
	DiskUsedGB       float64 `json:"diskUsedGb,omitempty"`
	UptimeSec        int64   `json:"uptimeSec,omitempty"`
	LoggedInUserHash string  `json:"loggedInUserHash,omitempty"`
}

// EnrollmentRequest is the body of POST /v1/noc/enroll.
type EnrollmentRequest struct {
	EnrollmentToken      string `json:"enrollmentToken"`
	PublicKey            string `json:"publicKey"`
	PublicKeyFingerprint string `json:"publicKeyFingerprint"`
	Hostname             string `json:"hostname"`
	FQDN                 string `json:"fqdn,omitempty"`
	OSFamily             string `json:"osFamily"`
	OSVersion            string `json:"osVersion,omitempty"`
	AgentVersion         string `json:"agentVersion"`
	AgentBinaryHash      string `json:"agentBinaryHash"`
}

type EnrollmentResponse struct {
	EndpointID      string      `json:"endpointId"`
	ClientID        string      `json:"clientId"`
	ServerPublicKey string      `json:"serverPublicKey"`
	Config          AgentConfig `json:"config"`
}

type AgentConfig struct {
	HeartbeatIntervalMinutes int            `json:"heartbeatIntervalMinutes"`
	Checks                   []ConfiguredCheck `json:"checks"`
}

type ConfiguredCheck struct {
	Slug            string         `json:"slug"`
	Severity        string         `json:"severity"`
	ScheduleMinutes int            `json:"scheduleMinutes"`
	Thresholds      map[string]any `json:"thresholds,omitempty"`
}
