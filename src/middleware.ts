import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const protectedPaths = [
  '/dashboard',
  '/profile',
  '/certificates',
  '/notifications',
  '/admin',
];

const authPaths = ['/auth/login', '/auth/register'];

const adminPaths = ['/admin'];

const teacherPaths = ['/dashboard/content/new', '/dashboard/groups'];

const onboardingPath = '/onboarding';

export async function middleware(req: NextRequest) {
  // Use secure cookie checks in production/proxy setups (e.g. Render)
  let token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production'
  });

  // Fallback: If getToken fails but we have the secure cookie, try to read it explicitly
  if (!token) {
    const secureCookie = req.cookies.get('__Secure-next-auth.session-token');
    if (secureCookie) {
      token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
        secureCookie: true,
        cookieName: '__Secure-next-auth.session-token'
      });
    }
  }
  const { pathname } = req.nextUrl;

  // Rate limiting for API routes
  if (pathname.startsWith('/api') && !pathname.startsWith('/api/auth')) {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    // Add IP header for API routes
    const response = NextResponse.next();
    response.headers.set('x-client-ip', ip);

    // Basic DDoS protection header
    const userAgent = req.headers.get('user-agent') || '';
    if (!userAgent || userAgent.length < 10) {
      return NextResponse.json(
        { error: 'Geçersiz istek' },
        { status: 403 }
      );
    }
  }

  // Allow onboarding page access for authenticated users
  if (pathname === onboardingPath) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
    return NextResponse.next();
  }

  // Redirect authenticated users away from auth pages
  if (authPaths.some((path) => pathname.startsWith(path))) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // Protect authenticated routes
  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    if (!token) {
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if user is banned
    if (token.isBanned) {
      return NextResponse.redirect(new URL('/auth/login?error=banned', req.url));
    }

    // Redirect directly without checking token dynamically for changes if they passed onboarding.
    // Instead, the login page and session expiry can handle forced checks on a new login.

    // Admin route protection
    if (adminPaths.some((path) => pathname.startsWith(path))) {
      if (token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // Teacher route protection
    if (teacherPaths.some((path) => pathname.startsWith(path))) {
      if (token.role !== 'TEACHER' && token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
  }

  // Security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
