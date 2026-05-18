import * as fs from 'fs';
import * as path from 'path';

const BACKEND_URL = process.env.API_URL ?? 'http://localhost:3000';
const DATA_JSON_PATH = path.resolve(__dirname, '../../docs/data.json');

/**
 * Playwright global setup: ingest docs/data.json into the backend before
 * running any E2E tests so the database is guaranteed to be populated.
 */
async function globalSetup(): Promise<void> {
    let bundle: unknown;

    try {
        const raw = fs.readFileSync(DATA_JSON_PATH, 'utf-8');
        bundle = JSON.parse(raw);
    } catch (err) {
        console.warn('[global-setup] Could not read docs/data.json:', err);
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/ingestion/bundles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bundle),
        });

        if (response.ok) {
            const summary = (await response.json()) as Record<string, unknown>;
            console.log(
                `[global-setup] Ingestion complete — total: ${String(summary['total'])}, processed: ${String(summary['processed'])}, skipped: ${String(summary['skipped'])}, failed: ${String(summary['failed'])}`,
            );
        } else {
            console.warn(
                `[global-setup] Ingestion returned HTTP ${response.status}. Tests may fail if data is missing.`,
            );
        }
    } catch (err) {
        console.warn(
            '[global-setup] Could not reach backend for ingestion. Is it running at',
            BACKEND_URL + '?',
            err,
        );
    }
}

export default globalSetup;
