import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const COOKIE_NAME = 'auth_token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

/**
 * Handles the final step of Google OAuth2:
 * The backend redirects here with ?token=<JWT> after successful authentication.
 * This route sets the httpOnly cookie and redirects to the main app.
 */
export async function GET(request: Request) {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
        return NextResponse.redirect(
            new URL('/login?error=google_failed', url),
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

    return NextResponse.redirect(new URL('/', url));
}
