import { apiFetch, type PaginatedResponse } from '@/lib/api-client';
import type { TLP } from '@/shared/types/enums';
import type {
    KillChainPhase,
    RelatedObjectItem,
    SightingItem,
    StixExternalRef,
    StixObject,
    Tool,
    ToolDetail,
    ToolDetailEntity,
    ToolFilters,
} from '../types';

interface BackendTool {
    id: string;
    name: string;
    description?: string;
    toolTypes: string[];
    killChainPhases: KillChainPhase[];
    toolVersion?: string;
    aliases: string[];
    confidence?: number;
    revoked: boolean;
    externalReferences: StixExternalRef[];
    tlp: TLP;
    createdAt: string;
    updatedAt: string;
}

function adaptTool(b: BackendTool): Tool {
    const primaryRef = b.externalReferences[0];
    return {
        id: b.id,
        name: b.name,
        description: b.description ?? null,
        entityType: 'tool',
        tlp: b.tlp,
        confidence: b.confidence ?? null,
        createdBy: primaryRef?.sourceName ?? null,
        source: primaryRef?.sourceName ?? null,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
    };
}

function adaptToolDetail(b: BackendTool): ToolDetailEntity {
    return {
        ...adaptTool(b),
        toolTypes: b.toolTypes,
        killChainPhases: b.killChainPhases,
        toolVersion: b.toolVersion,
        aliases: b.aliases,
        revoked: b.revoked,
        externalReferences: b.externalReferences,
    };
}

export async function fetchTools(
    filters: ToolFilters & { limit?: number },
): Promise<PaginatedResponse<Tool>> {
    const params = new URLSearchParams();
    if (filters.name) params.set('name', filters.name);
    if (filters.tlp) params.set('tlp', filters.tlp);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));

    const qs = params.toString();
    const raw = await apiFetch<PaginatedResponse<BackendTool>>(
        `/tools${qs ? `?${qs}` : ''}`,
    );

    return {
        data: raw.data.map(adaptTool),
        meta: raw.meta,
    };
}

export async function fetchToolDetail(id: string): Promise<ToolDetail> {
    const raw = await apiFetch<{
        entity: BackendTool;
        relatedObjects: Array<{
            relationship: RelatedObjectItem['relationship'];
            object: StixObject | null;
        }>;
        sightings: SightingItem[];
    }>(`/tools/${encodeURIComponent(id)}`);

    return {
        entity: adaptToolDetail(raw.entity),
        relatedObjects: raw.relatedObjects,
        sightings: raw.sightings,
    };
}
