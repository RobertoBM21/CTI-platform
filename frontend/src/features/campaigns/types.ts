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

/** Campaign catalog item — extends the generic CatalogEntity */
export type Campaign = CatalogEntity;

export type CampaignFilters = BaseCatalogFilters;

// ── Detail view types ──────────────────────────────────────────────────

/** Extended Campaign for the detail view — carries all backend fields */
export interface CampaignDetailEntity extends Campaign {
    firstSeen?: string;
    lastSeen?: string;
    objective?: string;
    aliases: string[];
    primaryMotivations: string[];
    secondaryMotivations: string[];
    revoked: boolean;
    externalReferences: StixExternalRef[];
}

export type CampaignDetail = EntityDetail<CampaignDetailEntity>;
