import { apiFetch } from '@/lib/api-client';
import type { IngestionResult, StixBundle } from '../types';

export async function ingestBundle(
    bundle: StixBundle,
): Promise<IngestionResult> {
    return apiFetch<IngestionResult>('/ingestion/bundles', {
        method: 'POST',
        body: JSON.stringify(bundle),
    });
}
