import { apiFetch, type PaginatedResponse } from '@/lib/api-client';
import type { TLP } from '@/shared/types/enums';
import type {
    AttackPatternFilters,
    AttackPatternItem,
    IntrusionSetFilters,
    IntrusionSetItem,
    KillChainPhaseItem,
} from '../types';

interface BackendAttackPattern {
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

interface BackendIntrusionSet {
    id: string;
    name: string;
    description?: string;
    aliases: string[];
    goals: string;
    resourceLevel?: string;
    primaryMotivations: string[];
    secondaryMotivations: string[];
    confidence?: number;
    revoked: boolean;
    tlp: TLP;
    createdAt: string;
    updatedAt: string;
}

function adaptAttackPattern(b: BackendAttackPattern): AttackPatternItem {
    return {
        id: b.id,
        name: b.name,
        description: b.description,
        aliases: b.aliases,
        externalReference: b.externalReference,
        killChainPhases: b.killChainPhases,
        confidence: b.confidence,
        revoked: b.revoked,
        tlp: b.tlp,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
    };
}

function adaptIntrusionSet(b: BackendIntrusionSet): IntrusionSetItem {
    return {
        id: b.id,
        name: b.name,
        description: b.description ?? null,
        entityType: 'intrusion-set',
        tlp: b.tlp,
        confidence: b.confidence ?? null,
        createdBy: null,
        source: null,
        aliases: b.aliases,
        goals: b.goals,
        resourceLevel: b.resourceLevel,
        primaryMotivations: b.primaryMotivations,
        secondaryMotivations: b.secondaryMotivations,
        revoked: b.revoked,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
    };
}

export async function fetchAttackPatterns(
    filters: AttackPatternFilters & { limit?: number },
): Promise<PaginatedResponse<AttackPatternItem>> {
    const params = new URLSearchParams();
    if (filters.name) params.set('name', filters.name);
    if (filters.tlp) params.set('tlp', filters.tlp);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));

    const qs = params.toString();
    const raw = await apiFetch<PaginatedResponse<BackendAttackPattern>>(
        `/attack-patterns${qs ? `?${qs}` : ''}`,
    );

    return {
        data: raw.data.map(adaptAttackPattern),
        meta: raw.meta,
    };
}

export async function fetchIntrusionSets(
    filters: IntrusionSetFilters & { limit?: number },
): Promise<PaginatedResponse<IntrusionSetItem>> {
    const params = new URLSearchParams();
    if (filters.name) params.set('name', filters.name);
    if (filters.tlp) params.set('tlp', filters.tlp);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));

    const qs = params.toString();
    const raw = await apiFetch<PaginatedResponse<BackendIntrusionSet>>(
        `/intrusion-sets${qs ? `?${qs}` : ''}`,
    );

    return {
        data: raw.data.map(adaptIntrusionSet),
        meta: raw.meta,
    };
}
