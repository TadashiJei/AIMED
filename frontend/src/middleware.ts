import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login', '/register', '/admin/login'];
const adminPaths = ['/admin'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const isAdmin = request.cookies.get('isAdmin');
  const { pathname } = request.nextUrl;

  // Check if trying to access admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!token || !isAdmin) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Allow public paths
  if (publicPaths.includes(pathname)) {
    if (token) {
      // If admin is logged in and tries to access login page, redirect to admin dashboard
      if (isAdmin && pathname === '/admin/login') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      // If regular user is logged in and tries to access login page, redirect to dashboard
      if (!isAdmin && pathname === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
    return NextResponse.next();
  }

  // Protect other routes
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
