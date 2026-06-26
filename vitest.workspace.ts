// Vitest 3 workspace — runs all per-app vitest configs in one command.
// Replaces Jest as the standard test runner across the monorepo (see Nest 12 roadmap).

import { defineWorkspace } from 'vitest/config'

export default defineWorkspace(['apps/*', 'packages/*'])
