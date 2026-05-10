import type { EntityType, TLP } from '@/shared/types/enums';

export interface Incident {
    id: string;
    name: string;
    description: string | null;
    entityType: EntityType;
    tlp: TLP;
    confidence: number | null;
    createdBy: string | null;
    source: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface IncidentFilters {
    name?: string;
    tlp?: TLP;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export type ViewMode = 'list' | 'grid';

// ── Detail view types ──────────────────────────────────────────────────

export interface StixExternalRef {
    sourceName: string;
    description?: string;
    externalId?: string;
    url?: string;
}

/** Generic STIX domain object as returned by the backend resolver */
export interface StixObject {
    id: string;
    name?: string;
    description?: string;
    confidence?: number;
    tlp?: string;
    createdAt?: string;
    updatedAt?: string;
    externalReferences?: StixExternalRef[];
    [key: string]: unknown;
}

export interface RelatedObjectItem {
    relationship: {
        id: string;
        relationshipType: string;
        description?: string;
        sourceRef: string;
        targetRef: string;
        startTime?: string;
        stopTime?: string;
        tlp: string;
        createdAt: string;
        updatedAt: string;
    };
    object: StixObject | null;
}

export interface SightingItem {
    id: string;
    description?: string;
    firstSeen?: string;
    lastSeen?: string;
    count: number;
    sightingOfRef: string;
    observedDataRefs: string[];
    whereSightedRefs: string[];
    tlp: string;
    createdAt: string;
    updatedAt: string;
}

/** Extended Incident for the detail view — carries all backend fields */
export interface IncidentDetailEntity extends Incident {
    firstSeen?: string;
    lastSeen?: string;
    objective?: string;
    revoked: boolean;
    externalReferences: StixExternalRef[];
}

export interface IncidentDetail {
    entity: IncidentDetailEntity;
    relatedObjects: RelatedObjectItem[];
    sightings: SightingItem[];
}
