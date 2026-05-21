import { apiFetch, type PaginatedResponse } from '@/lib/api-client';
import type { TLP } from '@/shared/types/enums';
import type {
    RelatedObjectItem,
    SightingItem,
    StixExternalRef,
    StixObject,
    Vulnerability,
    VulnerabilityDetail,
    VulnerabilityDetailEntity,
    VulnerabilityFilters,
} from '../types';

interface BackendVulnerability {
    id: string;
    name: string;
    description?: string;
    confidence?: number;
    revoked: boolean;
    externalReferences: StixExternalRef[];
    tlp: TLP;
    createdAt: string;
    updatedAt: string;
}

function adaptVulnerability(b: BackendVulnerability): Vulnerability {
    const cveRef = b.externalReferences.find(
        (r) =>
            r.sourceName?.toLowerCase() === 'cve' ||
            r.externalId?.startsWith('CVE'),
    );
    const primaryRef = cveRef ?? b.externalReferences[0];
    return {
        id: b.id,
        name: b.name,
        description: b.description ?? null,
        entityType: 'vulnerability',
        tlp: b.tlp,
        confidence: b.confidence ?? null,
        createdBy: primaryRef?.sourceName ?? null,
        source: primaryRef?.sourceName ?? null,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
    };
}

function adaptVulnerabilityDetail(
    b: BackendVulnerability,
): VulnerabilityDetailEntity {
    return {
        ...adaptVulnerability(b),
        revoked: b.revoked,
        externalReferences: b.externalReferences,
    };
}

export async function fetchVulnerabilities(
    filters: VulnerabilityFilters & { limit?: number },
): Promise<PaginatedResponse<Vulnerability>> {
    const params = new URLSearchParams();
    if (filters.name) params.set('name', filters.name);
    if (filters.tlp) params.set('tlp', filters.tlp);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));

    const qs = params.toString();
    const raw = await apiFetch<PaginatedResponse<BackendVulnerability>>(
        `/vulnerabilities${qs ? `?${qs}` : ''}`,
    );

    return {
        data: raw.data.map(adaptVulnerability),
        meta: raw.meta,
    };
}

export async function fetchVulnerabilityDetail(
    id: string,
): Promise<VulnerabilityDetail> {
    const raw = await apiFetch<{
        entity: BackendVulnerability;
        relatedObjects: Array<{
            relationship: RelatedObjectItem['relationship'];
            object: StixObject | null;
        }>;
        sightings: SightingItem[];
    }>(`/vulnerabilities/${encodeURIComponent(id)}`);

    return {
        entity: adaptVulnerabilityDetail(raw.entity),
        relatedObjects: raw.relatedObjects,
        sightings: raw.sightings,
    };
}
