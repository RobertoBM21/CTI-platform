import type {
    BaseCatalogFilters,
    CatalogEntity,
    EntityDetail,
    RelatedObjectItem,
    SightingItem,
    StixExternalRef,
    StixObject,
    ViewMode,
} from '@/shared/types/entity';

// Re-export shared types so existing imports keep working
export type {
    RelatedObjectItem,
    SightingItem,
    StixExternalRef,
    StixObject,
    ViewMode,
};

/** Incident catalog item — extends the generic CatalogEntity */
export type Incident = CatalogEntity;

export type IncidentFilters = BaseCatalogFilters;

// ── Detail view types ──────────────────────────────────────────────────

/** Extended Incident for the detail view — carries all backend fields */
export interface IncidentDetailEntity extends Incident {
    firstSeen?: string;
    lastSeen?: string;
    objective?: string;
    revoked: boolean;
    externalReferences: StixExternalRef[];
}

export type IncidentDetail = EntityDetail<IncidentDetailEntity>;
