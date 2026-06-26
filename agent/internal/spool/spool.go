// Bounded SQLite outbox for heartbeats that couldn't be delivered.
//
// v0.2.0 stub — interface only. Phase 2 implements with modernc.org/sqlite
// (CGo-free) so we keep a single static binary.

package spool

import "github.com/gitsols/noc-agent/pkg/types"

type Spool struct{}

func Open() (*Spool, error)                          { return &Spool{}, nil }
func (s *Spool) Append(_ types.HeartbeatPayload) error { return nil }
func (s *Spool) Drain(_ func(types.HeartbeatPayload) error) error { return nil }
func (s *Spool) Close() error                        { return nil }
