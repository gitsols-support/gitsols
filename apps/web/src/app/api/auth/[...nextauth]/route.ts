// Auth.js v5 route handlers. Mounted at /api/auth/* — handles sign-in,
// sign-out, callbacks, magic-link verification, etc.
//
// Don't add custom logic here. Configuration lives in `src/auth.ts`.

import { handlers } from '@/auth'

export const { GET, POST } = handlers
