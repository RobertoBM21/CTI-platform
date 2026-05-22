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

export type IntrusionSet = CatalogEntity;

export type IntrusionSetFilters = BaseCatalogFilters;

// ── Detail view types ──────────────────────────────────────────────────

export interface IntrusionSetDetailEntity extends IntrusionSet {
    aliases: string[];
    firstSeen?: string;
    lastSeen?: string;
    goals?: string;
    resourceLevel?: string;
    primaryMotivations: string[];
    secondaryMotivations: string[];
    revoked: boolean;
    externalReferences: StixExternalRef[];
}

export type IntrusionSetDetail = EntityDetail<IntrusionSetDetailEntity>;
