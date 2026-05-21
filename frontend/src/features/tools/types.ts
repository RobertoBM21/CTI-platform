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

export interface KillChainPhase {
    killChainName: string;
    phaseName: string;
}

export type Tool = CatalogEntity;

export type ToolFilters = BaseCatalogFilters;

// ── Detail view types ──────────────────────────────────────────────────

export interface ToolDetailEntity extends Tool {
    toolTypes: string[];
    killChainPhases: KillChainPhase[];
    toolVersion?: string;
    aliases: string[];
    revoked: boolean;
    externalReferences: StixExternalRef[];
}

export type ToolDetail = EntityDetail<ToolDetailEntity>;
