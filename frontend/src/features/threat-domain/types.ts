import type { BaseCatalogFilters, CatalogEntity } from '@/shared/types/entity';
import type { TLP } from '@/shared/types/enums';

// ── AttackPattern ──────────────────────────────────────────────────────

export interface KillChainPhaseItem {
    killChainName: string;
    phaseName: string;
}

export interface AttackPatternItem {
    id: string;
    name: string;
    description?: string;
    aliases: string[];
    externalReference?: string;
    killChainPhases: KillChainPhaseItem[];
    confidence?: number;
    revoked: boolean;
    tlp: TLP;
    createdAt: string;
    updatedAt: string;
}

export type AttackPatternFilters = BaseCatalogFilters;

// ── IntrusionSet ───────────────────────────────────────────────────────

export interface IntrusionSetItem extends CatalogEntity {
    aliases: string[];
    goals: string;
    resourceLevel?: string;
    primaryMotivations: string[];
    secondaryMotivations: string[];
    revoked: boolean;
}

export type IntrusionSetFilters = BaseCatalogFilters;

// ── ThreatDomain tabs ──────────────────────────────────────────────────

export type ThreatDomainTab =
    | 'all'
    | 'incidents'
    | 'campaigns'
    | 'threat-actors'
    | 'attack-patterns';

export interface SelectedAttackPattern {
    id: string;
    name: string;
}
