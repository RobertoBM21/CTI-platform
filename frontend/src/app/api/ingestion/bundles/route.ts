import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env['API_URL'] ?? 'http://localhost:3000';

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.text();

    const backendRes = await fetch(`${API_URL}/ingestion/bundles`, {
        method: 'POST',
        headers: {
            'Content-Type':
                request.headers.get('Content-Type') ?? 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body,
    });

    const responseBody = await backendRes.text();
    return new NextResponse(responseBody, {
        status: backendRes.status,
        headers: { 'Content-Type': 'application/json' },
    });
}
