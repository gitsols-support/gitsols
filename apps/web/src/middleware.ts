// Edge middleware — protects `/admin/dashboard`, `/admin/users`, etc.
// (everything under the (admin) route group) by redirecting unauthenticated
// requests to `/admin` (the sign-in page).
//
// `/admin` itself stays public so users can sign in.
// `/` and `/api/auth/*` and `/_next/*` are always public.

import { auth } from '@/auth'
import { NextResponse } from 'next/server'

// Dev-mode bypass: any one of the following enables auth-free /admin/* access.
//
//   1. NODE_ENV !== 'production' — local dev is always allowed.
//   2. ADMIN_DEV_BYPASS=true — explicit opt-in for staging/preview.
//   3. ?dev=1 on the URL — one-off escape hatch.
//
// Production with ADMIN_DEV_BYPASS=true is rejected at env-validation time.
const IS_DEV = process.env.NODE_ENV !== 'production'
const DEV_BYPASS_ENV = process.env.ADMIN_DEV_BYPASS === 'true'

export default auth((req) => {
  const { pathname, searchParams } = req.nextUrl
  const isAuthed = !!req.auth?.user

  // Public paths — always let through.
  const isPublic =
    pathname === '/' ||
    pathname === '/admin' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')

  if (isPublic) return NextResponse.next()

  // Dev-mode short-circuit: skip session check entirely under /admin/*.
  const devQuery = searchParams.get('dev') === '1'
  if (pathname.startsWith('/admin') && (IS_DEV || DEV_BYPASS_ENV || devQuery)) {
    return NextResponse.next()
  }

  // Everything else under /admin/* requires a session.
  if (pathname.startsWith('/admin') && !isAuthed) {
    const url = new URL('/admin', req.nextUrl)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|brand/).*)'],
}
