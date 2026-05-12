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

// Re-export shared types so feature-internal imports keep working
export type {
    RelatedObjectItem,
    SightingItem,
    StixExternalRef,
    StixObject,
    ViewMode,
};

/** Threat Actor catalog item — extends the generic CatalogEntity */
export type ThreatActor = CatalogEntity;

export type ThreatActorFilters = BaseCatalogFilters;

// ── Detail view types ──────────────────────────────────────────────────

/** Extended ThreatActor for the detail view — carries all backend fields */
export interface ThreatActorDetailEntity extends ThreatActor {
    threatActorTypes: string[];
    aliases: string[];
    firstSeen?: string;
    lastSeen?: string;
    roles: string[];
    goals?: string;
    sophistication?: string;
    resourceLevel?: string;
    primaryMotivations: string[];
    secondaryMotivations: string[];
    personalMotivations?: string;
    revoked: boolean;
    externalReferences: StixExternalRef[];
}

export type ThreatActorDetail = EntityDetail<ThreatActorDetailEntity>;
