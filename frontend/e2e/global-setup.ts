import * as fs from 'fs';
import * as path from 'path';

const BACKEND_URL = process.env.API_URL ?? 'http://localhost:3000';
const FRONTEND_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001';
const DATA_JSON_PATH = path.resolve(__dirname, '../../docs/data-sample.json');
const AUTH_STATE_PATH = path.resolve(__dirname, '.auth/state.json');
const COOKIE_NAME = 'auth_token';

const TEST_USER = {
    email: 'e2e@cti-platform.test',
    password: 'E2ePassword123!',
    name: 'E2E Test User',
};

/**
 * Playwright global setup:
 * 1. Registers the E2E test user (idempotent — ignores 409 conflicts).
 * 2. Logs in via backend to get a JWT, then ingests test data.
 * 3. Logs in via the frontend BFF to obtain an auth cookie and saves the
 *    Playwright storageState so all tests start pre-authenticated.
 */
async function globalSetup(): Promise<void> {
    // Ensure auth state directory exists
    const authDir = path.dirname(AUTH_STATE_PATH);
    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
    }

    // 1. Register test user (ignore 409 if already exists)
    try {
        await fetch(`${BACKEND_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(TEST_USER),
        });
    } catch {
        // Backend may not be running — ingestion step will warn
    }

    // 2. Login via backend to get JWT for the ingestion call
    let accessToken: string | null = null;
    try {
        const loginRes = await fetch(`${BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: TEST_USER.email,
                password: TEST_USER.password,
            }),
        });
        if (loginRes.ok) {
            const data = (await loginRes.json()) as {
                accessToken?: string;
            };
            accessToken = data.accessToken ?? null;
        } else {
            console.warn(
                `[global-setup] Backend login returned HTTP ${loginRes.status}`,
            );
        }
    } catch (err) {
        console.warn('[global-setup] Backend login failed:', err);
    }

    // 3. Ingest test data (endpoint requires Bearer token)
    let bundle: unknown;
    try {
        const raw = fs.readFileSync(DATA_JSON_PATH, 'utf-8');
        bundle = JSON.parse(raw);
    } catch (err) {
        console.warn('[global-setup] Could not read data-sample.json:', err);
    }

    if (bundle && accessToken) {
        try {
            const response = await fetch(`${BACKEND_URL}/ingestion/bundles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(bundle),
            });
            if (response.ok) {
                const summary = (await response.json()) as Record<
                    string,
                    unknown
                >;
                console.log(
                    `[global-setup] Ingestion complete — total: ${String(summary['total'])}, processed: ${String(summary['processed'])}, skipped: ${String(summary['skipped'])}, failed: ${String(summary['failed'])}`,
                );
            } else {
                console.warn(
                    `[global-setup] Ingestion returned HTTP ${response.status}. Tests may fail if data is missing.`,
                );
            }
        } catch (err) {
            console.warn('[global-setup] Ingestion failed:', err);
        }
    } else if (!accessToken) {
        console.warn(
            '[global-setup] Skipping data ingestion — could not obtain access token.',
        );
    }

    // 4. Login via the frontend BFF and save the auth cookie as Playwright
    //    storageState so every test starts with a valid session.
    try {
        const bffRes = await fetch(`${FRONTEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: TEST_USER.email,
                password: TEST_USER.password,
            }),
        });
        const setCookieHeader = bffRes.headers.get('set-cookie');
        if (setCookieHeader) {
            const match = new RegExp(`${COOKIE_NAME}=([^;]+)`).exec(
                setCookieHeader,
            );
            if (match) {
                const storageState = {
                    cookies: [
                        {
                            name: COOKIE_NAME,
                            value: match[1],
                            domain: 'localhost',
                            path: '/',
                            expires: -1,
                            httpOnly: true,
                            secure: false,
                            sameSite: 'Lax',
                        },
                    ],
                    origins: [] as never[],
                };
                fs.writeFileSync(
                    AUTH_STATE_PATH,
                    JSON.stringify(storageState, null, 2),
                );
                console.log(
                    '[global-setup] Auth state saved to',
                    AUTH_STATE_PATH,
                );
            } else {
                console.warn(
                    '[global-setup] Could not parse auth_token cookie from BFF response.',
                );
            }
        } else {
            console.warn(
                '[global-setup] No Set-Cookie header in BFF /api/auth/login response.',
            );
        }
    } catch (err) {
        console.warn(
            '[global-setup] Frontend BFF login failed — tests will run without auth state:',
            err,
        );
    }
}

export default globalSetup;
