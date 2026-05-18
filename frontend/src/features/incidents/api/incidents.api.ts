import { apiFetch, type PaginatedResponse } from '@/lib/api-client';
import type { TLP } from '@/shared/types/enums';
import type {
    Incident,
    IncidentDetail,
    IncidentDetailEntity,
    IncidentFilters,
    RelatedObjectItem,
    SightingItem,
    StixExternalRef,
    StixObject,
} from '../types';

interface BackendIncident {
    id: string;
    name: string;
    description?: string;
    firstSeen?: string;
    lastSeen?: string;
    objective?: string;
    confidence?: number;
    revoked: boolean;
    externalReferences: StixExternalRef[];
    tlp: TLP;
    createdAt: string;
    updatedAt: string;
}

function adaptIncident(b: BackendIncident): Incident {
    const primaryRef = b.externalReferences[0];
    return {
        id: b.id,
        name: b.name,
        description: b.description ?? null,
        entityType: 'incident',
        tlp: b.tlp,
        confidence: b.confidence ?? null,
        createdBy: primaryRef?.sourceName ?? null,
        source: primaryRef?.sourceName ?? null,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
    };
}

function adaptIncidentDetail(b: BackendIncident): IncidentDetailEntity {
    return {
        ...adaptIncident(b),
        firstSeen: b.firstSeen,
        lastSeen: b.lastSeen,
        objective: b.objective,
        revoked: b.revoked,
        externalReferences: b.externalReferences,
    };
}

export async function fetchIncidents(
    filters: IncidentFilters & { limit?: number; attackPatternId?: string },
): Promise<PaginatedResponse<Incident>> {
    const params = new URLSearchParams();
    if (filters.name) params.set('name', filters.name);
    if (filters.tlp) params.set('tlp', filters.tlp);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.attackPatternId)
        params.set('attackPatternId', filters.attackPatternId);

    const qs = params.toString();
    const raw = await apiFetch<PaginatedResponse<BackendIncident>>(
        `/incidents${qs ? `?${qs}` : ''}`,
    );

    return {
        data: raw.data.map(adaptIncident),
        meta: raw.meta,
    };
}

export async function fetchIncidentDetail(id: string): Promise<IncidentDetail> {
    const raw = await apiFetch<{
        entity: BackendIncident;
        relatedObjects: Array<{
            relationship: RelatedObjectItem['relationship'];
            object: StixObject | null;
        }>;
        sightings: SightingItem[];
    }>(`/incidents/${encodeURIComponent(id)}`);

    return {
        entity: adaptIncidentDetail(raw.entity),
        relatedObjects: raw.relatedObjects,
        sightings: raw.sightings,
    };
}
