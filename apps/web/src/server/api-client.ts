// Server-side helper for calling the Nest API as the current user.
//
//   import { apiFetch } from '@/server/api-client'
//   const me = await apiFetch<SessionUser>('/auth/me')
//
// Auth.js v5 stores its own session token ENCRYPTED (JWE), which the Nest API
// cannot verify. So for the API channel we mint a short-lived HS256-signed JWT
// from the current session, using the shared AUTH_SECRET + AUTH_ISSUER that the
// API's JwtAuthGuard verifies against. (AUTH_ISSUER must be identical on the
// web app and the API, or verification fails with "Invalid or expired token".)

import 'server-only'
import { createHmac } from 'node:crypto'
import { auth } from '@/auth'
import { env } from '@/env'

interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  /** Override the base URL — useful for SSR pointing at internal DNS. */
  baseUrl?: string
}

function b64url(input: string): string {
  return Buffer.from(input).toString('base64url')
}

/** Mint a signed JWT the Nest API can verify (HS256 + AUTH_SECRET + issuer). */
async function mintApiToken(): Promise<string | null> {
  const session = await auth()
  const user = session?.user
  if (!user?.id) return null
  const now = Math.floor(Date.now() / 1000)
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = b64url(
    JSON.stringify({
      id: user.id,
      email: user.email ?? '',
      name: user.name ?? '',
      role: user.role,
      accountId: user.accountId ?? null,
      iss: env.AUTH_ISSUER,
      iat: now,
      exp: now + 300,
    }),
  )
  const sig = createHmac('sha256', env.AUTH_SECRET).update(`${header}.${payload}`).digest('base64url')
  return `${header}.${payload}.${sig}`
}

export async function apiFetch<T>(path: string, opts: ApiFetchOptions = {}): Promise<T> {
  const { body, baseUrl, headers: extraHeaders, ...init } = opts
  const token = await mintApiToken()

  const url = `${baseUrl ?? env.NEXT_PUBLIC_API_URL}${path}`
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extraHeaders,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new ApiError(res.status, res.statusText, text)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

/**
 * Like apiFetch but returns the raw response bytes — used to proxy binary
 * downloads (e.g. invoice/proposal PDFs) through a Next route handler.
 */
export async function apiFetchRaw(
  path: string,
  opts: ApiFetchOptions = {},
): Promise<{ body: ArrayBuffer; contentType: string; disposition: string | null }> {
  const { body, baseUrl, headers: extraHeaders, ...init } = opts
  void body
  const token = await mintApiToken()
  const url = `${baseUrl ?? env.NEXT_PUBLIC_API_URL}${path}`
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extraHeaders,
    },
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new ApiError(res.status, res.statusText, text)
  }
  return {
    body: await res.arrayBuffer(),
    contentType: res.headers.get('content-type') ?? 'application/octet-stream',
    disposition: res.headers.get('content-disposition'),
  }
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: string,
  ) {
    super(`API ${status} ${statusText}${body ? `: ${body}` : ''}`)
    this.name = 'ApiError'
  }
}
