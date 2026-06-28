// Edge middleware — gates the authenticated admin and client-portal surfaces.
//
//   /admin            → internal staff sign-in (public)
//   /admin/*          → requires a session (allowlisted staff)
//   /portal           → client sign-in (public)
//   /portal/*         → requires a session (client roles)
//
// First-login password reset is enforced for both: a user whose
// mustResetPassword flag is set is redirected to the matching reset page
// before any other protected page.

import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const user = req.auth?.user
  const isAuthed = !!user

  const isPublic =
    pathname === '/' ||
    pathname === '/admin' ||
    pathname === '/portal' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')

  if (isPublic) return NextResponse.next()

  const protectedPrefix = pathname.startsWith('/admin')
    ? '/admin'
    : pathname.startsWith('/portal')
      ? '/portal'
      : null

  if (!protectedPrefix) return NextResponse.next()

  // Not signed in → bounce to the matching sign-in page.
  if (!isAuthed) {
    const url = new URL(protectedPrefix, req.nextUrl)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  // Force first-login password reset before anything else.
  const resetPath = `${protectedPrefix}/reset-password`
  if (user?.mustResetPassword && pathname !== resetPath) {
    return NextResponse.redirect(new URL(resetPath, req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|brand/).*)'],
}
