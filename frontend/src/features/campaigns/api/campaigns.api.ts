import { apiFetch, type PaginatedResponse } from '@/lib/api-client';
import type { TLP } from '@/shared/types/enums';
import type {
    Campaign,
    CampaignDetail,
    CampaignDetailEntity,
    CampaignFilters,
    RelatedObjectItem,
    SightingItem,
    StixExternalRef,
    StixObject,
} from '../types';

interface BackendCampaign {
    id: string;
    name: string;
    description?: string;
    firstSeen?: string;
    lastSeen?: string;
    objective?: string;
    aliases: string[];
    primaryMotivations: string[];
    secondaryMotivations: string[];
    confidence?: number;
    revoked: boolean;
    externalReferences: StixExternalRef[];
    tlp: TLP;
    createdAt: string;
    updatedAt: string;
}

function adaptCampaign(b: BackendCampaign): Campaign {
    const primaryRef = b.externalReferences[0];
    return {
        id: b.id,
        name: b.name,
        description: b.description ?? null,
        entityType: 'campaign',
        tlp: b.tlp,
        confidence: b.confidence ?? null,
        createdBy: primaryRef?.sourceName ?? null,
        source: primaryRef?.sourceName ?? null,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
    };
}

function adaptCampaignDetail(b: BackendCampaign): CampaignDetailEntity {
    return {
        ...adaptCampaign(b),
        firstSeen: b.firstSeen,
        lastSeen: b.lastSeen,
        objective: b.objective,
        aliases: b.aliases,
        primaryMotivations: b.primaryMotivations,
        secondaryMotivations: b.secondaryMotivations,
        revoked: b.revoked,
        externalReferences: b.externalReferences,
    };
}

export async function fetchCampaigns(
    filters: CampaignFilters & {
        limit?: number;
        attackPatternId?: string;
        intrusionSetId?: string;
    },
): Promise<PaginatedResponse<Campaign>> {
    const params = new URLSearchParams();
    if (filters.name) params.set('name', filters.name);
    if (filters.tlp) params.set('tlp', filters.tlp);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.attackPatternId)
        params.set('attackPatternId', filters.attackPatternId);
    if (filters.intrusionSetId)
        params.set('intrusionSetId', filters.intrusionSetId);

    const qs = params.toString();
    const raw = await apiFetch<PaginatedResponse<BackendCampaign>>(
        `/campaigns${qs ? `?${qs}` : ''}`,
    );

    return {
        data: raw.data.map(adaptCampaign),
        meta: raw.meta,
    };
}

export async function fetchCampaignDetail(id: string): Promise<CampaignDetail> {
    const raw = await apiFetch<{
        entity: BackendCampaign;
        relatedObjects: Array<{
            relationship: RelatedObjectItem['relationship'];
            object: StixObject | null;
        }>;
        sightings: SightingItem[];
    }>(`/campaigns/${encodeURIComponent(id)}`);

    return {
        entity: adaptCampaignDetail(raw.entity),
        relatedObjects: raw.relatedObjects,
        sightings: raw.sightings,
    };
}
