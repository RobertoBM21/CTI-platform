import { NextResponse } from 'next/server';

const API_URL = process.env['API_URL'] ?? 'http://localhost:3000';

/**
 * Redirects the browser to the backend Google OAuth2 initiation endpoint.
 * The backend redirects to Google, which then calls back to
 * GET /auth/google/callback on the backend.
 * After processing, the backend redirects to /api/auth/google/callback on the frontend.
 */
export function GET() {
    return NextResponse.redirect(`${API_URL}/auth/google`);
}
