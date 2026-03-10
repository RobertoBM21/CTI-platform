const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export async function apiFetch<T>(
    path: string,
    init?: RequestInit,
): Promise<T> {
    const url = `${BASE_URL}${path}`;
    const res = await fetch(url, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...init?.headers,
        },
    });

    if (!res.ok) {
        throw new Error(`API error ${res.status}: ${res.statusText}`);
    }

    return res.json() as Promise<T>;
}
