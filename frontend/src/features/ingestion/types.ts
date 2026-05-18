export interface IngestionResult {
    total: number;
    processed: number;
    skipped: number;
    failed: number;
}

/** Minimal shape of a valid STIX 2.1 bundle */
export interface StixBundle {
    type: 'bundle';
    id: string;
    objects: Record<string, unknown>[];
}
