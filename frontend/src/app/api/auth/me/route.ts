import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env['API_URL'] ?? 'http://localhost:3000';

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        return NextResponse.json(null, { status: 401 });
    }

    const backendRes = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!backendRes.ok) {
        return NextResponse.json(null, { status: 401 });
    }

    const user = await backendRes.json();
    return NextResponse.json(user);
}
