import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token');
    const url = new URL(request.url);

    // If user has token and tries to access auth pages, redirect to home
    if (token != null && token != undefined && (url.pathname === '/sign-in' || url.pathname === '/sign-up')) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Protected routes that require authentication
    const protectedRoutes = ['/properties', '/roommates', '/profile', '/onboarding'];
    const isProtectedRoute = protectedRoutes.some(route => url.pathname.startsWith(route));

    // If no token and trying to access protected route, redirect to sign-in
    if (!token && isProtectedRoute) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/((?!$|_next|static|favicon.ico|assets).*)',
};