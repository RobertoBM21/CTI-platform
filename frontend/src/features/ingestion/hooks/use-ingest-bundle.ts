import { useMutation } from '@tanstack/react-query';
import { ingestBundle } from '../api/ingestion.api';
import type { StixBundle } from '../types';

export function useIngestBundle() {
    return useMutation({
        mutationFn: (bundle: StixBundle) => ingestBundle(bundle),
    });
}
