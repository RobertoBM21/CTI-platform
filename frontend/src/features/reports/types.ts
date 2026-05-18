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

/** Report catalog item — extends the generic CatalogEntity */
export type Report = CatalogEntity;

export type ReportFilters = BaseCatalogFilters;

// ── Detail view types ──────────────────────────────────────────────────

/** Extended Report for the detail view — carries all backend fields */
export interface ReportDetailEntity extends Report {
    published: string;
    reportTypes: string[];
    objectRefs: StixObject[];
    revoked: boolean;
    externalReferences: StixExternalRef[];
}

export type ReportDetail = EntityDetail<ReportDetailEntity>;
