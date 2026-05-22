import type { EntityType, TLP } from './enums';

// ── STIX shared objects ────────────────────────────────────────────────

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

export interface RelatedReportItem {
    id: string;
    name: string;
    published: string;
    confidence?: number;
    tlp: TLP;
    reportTypes?: string[];
}

// ── Base entity interfaces ─────────────────────────────────────────────

/** Common fields shared by all catalog entities (list cards, list rows) */
export interface CatalogEntity {
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

/** Minimum entity fields required by detail-view tabs */
export interface EntityBase {
    id: string;
    name: string;
    description: string | null;
    confidence: number | null;
    createdBy: string | null;
    createdAt: string;
    updatedAt: string;
    /** Used by TimelineTab */
    firstSeen?: string;
    /** Used by TimelineTab */
    lastSeen?: string;
}

/** Generic detail payload accepted by all shared tabs */
export interface EntityDetail<TEntity extends EntityBase = EntityBase> {
    entity: TEntity;
    relatedObjects: RelatedObjectItem[];
    sightings: SightingItem[];
    relatedReports?: RelatedReportItem[];
}

export type ViewMode = 'list' | 'grid';

export interface BaseCatalogFilters {
    name?: string;
    tlp?: TLP;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}
