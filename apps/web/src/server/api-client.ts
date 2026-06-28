// Server-side helper for calling the Nest API with the current user's JWT.
//
// Usage in a server component / server action:
//
//   import { apiFetch } from '@/server/api-client'
//   const me = await apiFetch<SessionUser>('/auth/me')
//
// Throws on non-2xx; the page boundary or action can decide how to surface
// the error. Phase 2 adds typed endpoints generated from the Nest Swagger
// spec — until then, callers pass the return type as the generic param.

import 'server-only'
import { getToken } from 'next-auth/jwt'
import { headers } from 'next/headers'
import { env } from '@/env'

// On HTTPS deployments (Vercel prod), Auth.js stores the session JWT in a
// `__Secure-`-prefixed cookie. getToken must be told this or it looks for the
// wrong cookie name and returns null (→ no Bearer → 401 from the API).
const SECURE_COOKIE = process.env.NODE_ENV === 'production'

interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  /** Override the base URL — useful for SSR pointing at internal DNS. */
  baseUrl?: string
}

export async function apiFetch<T>(path: string, opts: ApiFetchOptions = {}): Promise<T> {
  const { body, baseUrl, headers: extraHeaders, ...init } = opts

  // Read the encoded JWT from the request cookie. `getToken` accepts the
  // request via the headers() API in Next 16. The raw token is what the
  // Nest API expects as the Bearer.
  const reqHeaders = await headers()
  const rawToken = await getToken({
    // next-auth's getToken expects a NextRequest-like; reconstruct from
    // headers() since we're in a server context.
    req: { headers: reqHeaders } as unknown as Parameters<typeof getToken>[0]['req'],
    secret: env.AUTH_SECRET,
    raw: true,
    secureCookie: SECURE_COOKIE,
  })

  const url = `${baseUrl ?? env.NEXT_PUBLIC_API_URL}${path}`
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(rawToken ? { Authorization: `Bearer ${rawToken}` } : {}),
      ...extraHeaders,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new ApiError(res.status, res.statusText, text)
  }

  // 204 No Content
  if (res.status === 204) return undefined as T

  return (await res.json()) as T
}


/**
 * Like apiFetch but returns the raw response bytes — used to proxy binary
 * downloads (e.g. invoice/proposal PDFs) through a Next route handler so the
 * browser request carries no Bearer token.
 */
export async function apiFetchRaw(
  path: string,
  opts: ApiFetchOptions = {},
): Promise<{ body: ArrayBuffer; contentType: string; disposition: string | null }> {
  const { body, baseUrl, headers: extraHeaders, ...init } = opts
  void body
  const reqHeaders = await headers()
  const rawToken = await getToken({
    req: { headers: reqHeaders } as unknown as Parameters<typeof getToken>[0]['req'],
    secret: env.AUTH_SECRET,
    raw: true,
    secureCookie: SECURE_COOKIE,
  })
  const url = `${baseUrl ?? env.NEXT_PUBLIC_API_URL}${path}`
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(rawToken ? { Authorization: `Bearer ${rawToken}` } : {}),
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
