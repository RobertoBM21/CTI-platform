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

export type {
    RelatedObjectItem,
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
    externalReferences: StixExternalRef[];
}

export type VulnerabilityDetail = EntityDetail<VulnerabilityDetailEntity>;
