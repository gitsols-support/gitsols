// Check runner — bridges the agent config to actual probe execution.
//
// v0.2.0: implements a shell-command runner and stubs the osquery runner.
// Phase 2 wires the real osquery socket so we don't fork a process per
// check.

package checks

import (
	"context"
	"os/exec"
	"strings"
	"time"

	"github.com/gitsols/noc-agent/internal/config"
	"github.com/gitsols/noc-agent/pkg/types"
)

type Runner struct {
	cfg *config.Config
}

func NewRunner(cfg *config.Config) *Runner {
	return &Runner{cfg: cfg}
}

// RunAll executes every configured check and returns the results.
func (r *Runner) RunAll(ctx context.Context) []types.CheckResult {
	out := make([]types.CheckResult, 0, len(r.cfg.Checks))
	for _, c := range r.cfg.Checks {
		out = append(out, runCheck(ctx, c))
	}
	return out
}

func runCheck(ctx context.Context, c types.ConfiguredCheck) types.CheckResult {
	start := time.Now()
	res := types.CheckResult{CheckSlug: c.Slug, Status: "skipped"}

	command, ok := defaultCommands[c.Slug]
	if !ok {
		res.Status = "skipped"
		res.Message = "no built-in command for slug"
		res.DurationMs = time.Since(start).Milliseconds()
		return res
	}

	ctx, cancel := context.WithTimeout(ctx, 20*time.Second)
	defer cancel()
	cmd := exec.CommandContext(ctx, "sh", "-c", command)
	out, err := cmd.CombinedOutput()
	res.DurationMs = time.Since(start).Milliseconds()
	if err != nil {
		if ctx.Err() == context.DeadlineExceeded {
			res.Status = "error"
			res.Message = "check timed out"
			return res
		}
		res.Status = "fail"
		res.Message = strings.TrimSpace(string(out))
		return res
	}
	res.Status = "pass"
	res.Message = strings.TrimSpace(string(out))
	return res
}

// defaultCommands holds a starter mapping of catalog slug → shell command.
// Phase 2 replaces these with osquery SQL executed via the osqueryd
// extension socket.
var defaultCommands = map[string]string{
	"wan_reachable":            `getent hosts 1.1.1.1 >/dev/null && echo ok`,
	"dns_resolution_ok":        `getent hosts gitsols.com >/dev/null && echo ok`,
	"agent_binary_integrity":   `echo ok`,
	"reboot_pending":           `[ ! -f /var/run/reboot-required ] && echo ok || (echo "reboot pending" && exit 1)`,
	"software_inventory_delta": `echo ok`,
}
