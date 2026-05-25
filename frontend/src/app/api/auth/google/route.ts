import { NextResponse } from 'next/server';

const BACKEND_PUBLIC_URL =
    process.env['BACKEND_PUBLIC_URL'] ?? 'http://localhost:3000';

/**
 * Redirects the browser to the backend Google OAuth2 initiation endpoint.
 * The backend redirects to Google, which then calls back to
 * GET /auth/google/callback on the backend.
 * After processing, the backend redirects to /api/auth/google/callback on the frontend.
 */
export function GET() {
    return NextResponse.redirect(`${BACKEND_PUBLIC_URL}/auth/google`);
}
