import type {
    BaseCatalogFilters,
    CatalogEntity,
    EntityDetail,
    RelatedObjectItem,
    RelatedReportItem,
    SightingItem,
    StixExternalRef,
    StixObject,
    ViewMode,
} from '@/shared/types/entity';

export type {
    RelatedObjectItem,
    RelatedReportItem,
    SightingItem,
    StixExternalRef,
    StixObject,
    ViewMode,
};

export type Vulnerability = CatalogEntity;

export type VulnerabilityFilters = BaseCatalogFilters;

// ── Detail view types ──────────────────────────────────────────────────

export interface VulnerabilityDetailEntity extends Vulnerability {
    revoked: boolean;
    xCvss3BaseScore?: number;
    xCvss3Vector?: string;
    xEpssScore?: number;
    externalReferences: StixExternalRef[];
}

export type VulnerabilityDetail = EntityDetail<VulnerabilityDetailEntity>;
