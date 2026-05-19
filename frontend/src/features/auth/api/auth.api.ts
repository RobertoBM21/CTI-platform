import type { AuthUser, LoginCredentials, RegisterCredentials } from '../types';

export async function loginApi(
    credentials: LoginCredentials,
): Promise<AuthUser> {
    const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });
    if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
            message?: string;
        };
        throw new Error(body.message ?? 'Invalid credentials');
    }
    return res.json() as Promise<AuthUser>;
}

export async function registerApi(
    credentials: RegisterCredentials,
): Promise<AuthUser> {
    const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });
    if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
            message?: string;
        };
        throw new Error(body.message ?? 'Registration failed');
    }
    return res.json() as Promise<AuthUser>;
}

export async function logoutApi(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST' });
}

export async function getMeApi(): Promise<AuthUser | null> {
    const res = await fetch('/api/auth/me');
    if (!res.ok) return null;
    return res.json() as Promise<AuthUser>;
}
