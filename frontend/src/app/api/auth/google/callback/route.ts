import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'auth_token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

/**
 * Handles the final step of Google OAuth2:
 * The backend redirects here with ?token=<JWT> after successful authentication.
 * This route sets the httpOnly cookie and redirects to the main app.
 */
export async function GET(request: NextRequest) {
    const token = request.nextUrl.searchParams.get('token');
    const host =
        request.headers.get('x-forwarded-host') ??
        request.headers.get('host') ??
        'localhost:3001';
    const proto = request.headers.get('x-forwarded-proto') ?? 'http';
    const base = `${proto}://${host}`;

    if (!token) {
        return NextResponse.redirect(
            new URL('/login?error=google_failed', base),
        );
    }

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env['NODE_ENV'] === 'production',
        sameSite: 'lax',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
    });

    return NextResponse.redirect(new URL('/', base));
}
