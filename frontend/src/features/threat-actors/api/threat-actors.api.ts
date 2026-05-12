import { apiFetch, type PaginatedResponse } from '@/lib/api-client';
import type { TLP } from '@/shared/types/enums';
import type {
    RelatedObjectItem,
    SightingItem,
    StixExternalRef,
    StixObject,
    ThreatActor,
    ThreatActorDetail,
    ThreatActorDetailEntity,
    ThreatActorFilters,
} from '../types';

interface BackendThreatActor {
    id: string;
    name: string;
    description?: string;
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
    confidence?: number;
    revoked: boolean;
    externalReferences: StixExternalRef[];
    tlp: TLP;
    createdAt: string;
    updatedAt: string;
}

function adaptThreatActor(b: BackendThreatActor): ThreatActor {
    const primaryRef = b.externalReferences[0];
    return {
        id: b.id,
        name: b.name,
        description: b.description ?? null,
        entityType: 'threat-actor',
        tlp: b.tlp,
        confidence: b.confidence ?? null,
        createdBy: primaryRef?.sourceName ?? null,
        source: primaryRef?.sourceName ?? null,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
    };
}

function adaptThreatActorDetail(
    b: BackendThreatActor,
): ThreatActorDetailEntity {
    return {
        ...adaptThreatActor(b),
        threatActorTypes: b.threatActorTypes,
        aliases: b.aliases,
        firstSeen: b.firstSeen,
        lastSeen: b.lastSeen,
        roles: b.roles,
        goals: b.goals,
        sophistication: b.sophistication,
        resourceLevel: b.resourceLevel,
        primaryMotivations: b.primaryMotivations,
        secondaryMotivations: b.secondaryMotivations,
        personalMotivations: b.personalMotivations,
        revoked: b.revoked,
        externalReferences: b.externalReferences,
    };
}

export async function fetchThreatActors(
    filters: ThreatActorFilters & { limit?: number },
): Promise<PaginatedResponse<ThreatActor>> {
    const params = new URLSearchParams();
    if (filters.name) params.set('name', filters.name);
    if (filters.tlp) params.set('tlp', filters.tlp);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));

    const qs = params.toString();
    const raw = await apiFetch<PaginatedResponse<BackendThreatActor>>(
        `/threat-actors${qs ? `?${qs}` : ''}`,
    );

    return {
        data: raw.data.map(adaptThreatActor),
        meta: raw.meta,
    };
}

export async function fetchThreatActorDetail(
    id: string,
): Promise<ThreatActorDetail> {
    const raw = await apiFetch<{
        entity: BackendThreatActor;
        relatedObjects: Array<{
            relationship: RelatedObjectItem['relationship'];
            object: StixObject | null;
        }>;
        sightings: SightingItem[];
    }>(`/threat-actors/${encodeURIComponent(id)}`);

    return {
        entity: adaptThreatActorDetail(raw.entity),
        relatedObjects: raw.relatedObjects,
        sightings: raw.sightings,
    };
}
