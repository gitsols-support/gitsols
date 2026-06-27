// Edge middleware — protects everything under `/admin/*` (except the `/admin`
// sign-in page) by redirecting unauthenticated requests to `/admin`.
//
// `/` and `/api/auth/*` and `/_next/*` are always public. There is no auth
// bypass: admin access requires a valid session whose email is on the
// ADMIN_EMAILS allowlist (enforced in `auth.ts`).

import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthed = !!req.auth?.user

  const isPublic =
    pathname === '/' ||
    pathname === '/admin' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')

  if (isPublic) return NextResponse.next()

  // Force first-login password reset before any other admin page.
  if (
    isAuthed &&
    req.auth?.user?.mustResetPassword &&
    pathname !== '/admin/reset-password'
  ) {
    return NextResponse.redirect(new URL('/admin/reset-password', req.nextUrl))
  }

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
