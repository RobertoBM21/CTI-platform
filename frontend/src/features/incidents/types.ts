import type {
    CatalogEntity,
    EntityDetail,
    RelatedObjectItem,
    SightingItem,
    StixExternalRef,
    StixObject,
    ViewMode,
} from '@/shared/types/entity';
import type { TLP } from '@/shared/types/enums';

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

export interface IncidentFilters {
    name?: string;
    tlp?: TLP;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

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
