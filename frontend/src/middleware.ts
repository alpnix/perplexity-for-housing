import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token');
    const url = new URL(request.url);

    // Debug logging
    console.log(`Middleware: ${url.pathname}, Token: ${token ? 'exists' : 'missing'}`);

    // If user has token and tries to access auth pages, redirect to home
    if (token != null && token != undefined && (url.pathname === '/sign-in' || url.pathname === '/sign-up')) {
        console.log('Redirecting authenticated user away from auth pages');
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Protected routes that require authentication
    const protectedRoutes = ['/properties', '/roommates', '/profile', '/onboarding', '/agents'];
    const isProtectedRoute = protectedRoutes.some(route => url.pathname.startsWith(route));

    // If no token and trying to access protected route, redirect to sign-in
    if (!token && isProtectedRoute) {
        console.log(`Redirecting to sign-in: no token for protected route ${url.pathname}`);
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/((?!$|_next|static|favicon.ico|assets).*)',
};