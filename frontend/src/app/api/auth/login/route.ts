import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env['API_URL'] ?? 'http://localhost:3000';
const COOKIE_NAME = 'auth_token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

function buildCookieOptions() {
    return {
        httpOnly: true,
        secure: process.env['NODE_ENV'] === 'production',
        sameSite: 'lax' as const,
        maxAge: COOKIE_MAX_AGE,
        path: '/',
    };
}

export async function POST(request: Request) {
    const body = await request.json();

    const backendRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!backendRes.ok) {
        const error = (await backendRes.json().catch(() => ({}))) as {
            message?: string;
        };
        return NextResponse.json(
            { message: error.message ?? 'Invalid credentials' },
            { status: backendRes.status },
        );
    }

    const data = (await backendRes.json()) as {
        accessToken?: string;
        user?: unknown;
    };

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, data.accessToken ?? '', buildCookieOptions());

    return NextResponse.json(data.user ?? {});
}
