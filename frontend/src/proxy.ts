import { type NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = [
    '/login',
    '/register',
    '/api/auth/',
    '/_next/',
    '/favicon.ico',
];

function isPublicPath(pathname: string): boolean {
    return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('auth_token')?.value;

    if (isPublicPath(pathname)) {
        // Redirect already-authenticated users away from login/register
        if (token && (pathname === '/login' || pathname === '/register')) {
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }

    // Protected path — redirect to login if no token
    if (!token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('next', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all paths except static assets.
         * Excludes: _next/static, _next/image, public folder files.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
