// Auth.js v5 configuration — single source of truth for web-side auth.
//
// Exports `auth`, `handlers`, `signIn`, `signOut` — used by:
//   - app/api/auth/[...nextauth]/route.ts  (handlers)
//   - middleware.ts                         (auth() as middleware)
//   - server components & actions           (auth() to read session)
//   - /admin sign-in page                   (signIn() client action)
//
// Providers wired:
//   - Microsoft Entra ID (M365 SSO)
//   - Google (Workspace SSO)
//   - Postmark magic-link email
//
// Providers with empty credentials are skipped at boot — dev can run with
// only the magic-link provider configured, or with no providers at all
// (the existing stub sign-in still works for clicking through to /admin/dashboard).

import NextAuth, { type NextAuthConfig, type DefaultSession } from 'next-auth'
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id'
import Google from 'next-auth/providers/google'
import Postmark from 'next-auth/providers/postmark'
import type { Role } from '@gitsols/types'
import { env } from './env'

// Extend the default session shape with our SessionUser fields. This is the
// shape `useSession()` and `auth()` return everywhere.
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: Role
      accountId: string | null
    } & DefaultSession['user']
    /** Encoded JWT — passed to the Nest API as the Bearer token. */
    apiToken: string
  }

  interface User {
    role?: Role
    accountId?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: Role
    accountId?: string | null
  }
}

const providers: NextAuthConfig['providers'] = []

if (env.AUTH_MICROSOFT_ENTRA_ID && env.AUTH_MICROSOFT_ENTRA_SECRET) {
  providers.push(
    MicrosoftEntraID({
      clientId: env.AUTH_MICROSOFT_ENTRA_ID,
      clientSecret: env.AUTH_MICROSOFT_ENTRA_SECRET,
      issuer: `https://login.microsoftonline.com/${env.AUTH_MICROSOFT_ENTRA_TENANT_ID}/v2.0`,
    }),
  )
}

if (env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    }),
  )
}

if (env.POSTMARK_API_TOKEN) {
  providers.push(
    Postmark({
      apiKey: env.POSTMARK_API_TOKEN,
      from: env.POSTMARK_FROM_ADDRESS,
    }),
  )
}

export const authConfig: NextAuthConfig = {
  secret: env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/admin',
  },
  providers,
  callbacks: {
    /**
     * Runs on every JWT refresh (sign-in, page navigation, etc.).
     * Phase 0: pull role + accountId from a DB lookup keyed on email. We don't
     * have that DB-side yet, so we default everyone to a placeholder "owner"
     * role to keep the click-through demo functional. Phase 2 wires the
     * real lookup via the Nest API's /auth/whoami endpoint.
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role ?? 'owner' // Phase 0 placeholder
        token.accountId = user.accountId ?? null
      }
      return token
    },
    /**
     * Project JWT fields onto the session object the app sees.
     * We also issue an `apiToken` (the encoded JWT) the web layer sends to
     * the Nest API as the Bearer token. Phase 2 will sign a separate
     * shorter-lived token for the API channel; for now the session JWT
     * doubles as the API bearer because both verify with AUTH_SECRET.
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? ''
        session.user.role = token.role ?? 'readonly'
        session.user.accountId = token.accountId ?? null
      }
      // The raw JWT isn't exposed to session() in Auth.js v5; the API token
      // is fetched via getToken() in server actions. See server/api-client.ts.
      session.apiToken = ''
      return session
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
