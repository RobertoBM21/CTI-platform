import { apiFetch, type PaginatedResponse } from '@/lib/api-client';
import type { TLP } from '@/shared/types/enums';
import type {
    IntrusionSet,
    IntrusionSetDetail,
    IntrusionSetDetailEntity,
    IntrusionSetFilters,
    RelatedObjectItem,
    SightingItem,
    StixExternalRef,
    StixObject,
} from '../types';

interface BackendIntrusionSet {
    id: string;
    name: string;
    description?: string;
    aliases: string[];
    firstSeen?: string;
    lastSeen?: string;
    goals?: string;
    resourceLevel?: string;
    primaryMotivations: string[];
    secondaryMotivations: string[];
    confidence?: number;
    revoked: boolean;
    externalReferences: StixExternalRef[];
    tlp: TLP;
    createdAt: string;
    updatedAt: string;
}

function adaptIntrusionSet(b: BackendIntrusionSet): IntrusionSet {
    const primaryRef = b.externalReferences[0];
    return {
        id: b.id,
        name: b.name,
        description: b.description ?? null,
        entityType: 'intrusion-set',
        tlp: b.tlp,
        confidence: b.confidence ?? null,
        createdBy: primaryRef?.sourceName ?? null,
        source: primaryRef?.sourceName ?? null,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
    };
}

function adaptIntrusionSetDetail(
    b: BackendIntrusionSet,
): IntrusionSetDetailEntity {
    return {
        ...adaptIntrusionSet(b),
        aliases: b.aliases,
        firstSeen: b.firstSeen,
        lastSeen: b.lastSeen,
        goals: b.goals,
        resourceLevel: b.resourceLevel,
        primaryMotivations: b.primaryMotivations,
        secondaryMotivations: b.secondaryMotivations,
        revoked: b.revoked,
        externalReferences: b.externalReferences,
    };
}

export async function fetchIntrusionSets(
    filters: IntrusionSetFilters & { limit?: number },
): Promise<PaginatedResponse<IntrusionSet>> {
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

export async function fetchIntrusionSetDetail(
    id: string,
): Promise<IntrusionSetDetail> {
    const raw = await apiFetch<{
        entity: BackendIntrusionSet;
        relatedObjects: Array<{
            relationship: RelatedObjectItem['relationship'];
            object: StixObject | null;
        }>;
        sightings: SightingItem[];
    }>(`/intrusion-sets/${encodeURIComponent(id)}`);

    return {
        entity: adaptIntrusionSetDetail(raw.entity),
        relatedObjects: raw.relatedObjects,
        sightings: raw.sightings,
    };
}
