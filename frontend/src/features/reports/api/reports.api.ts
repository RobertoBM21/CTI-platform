import { apiFetch, type PaginatedResponse } from '@/lib/api-client';
import type { TLP } from '@/shared/types/enums';
import type {
    RelatedObjectItem,
    Report,
    ReportDetail,
    ReportDetailEntity,
    ReportFilters,
    SightingItem,
    StixExternalRef,
    StixObject,
} from '../types';

interface BackendReport {
    id: string;
    name: string;
    description?: string;
    published: string;
    reportTypes: string[];
    objectRefs: StixObject[];
    confidence?: number;
    revoked: boolean;
    externalReferences: StixExternalRef[];
    tlp: TLP;
    createdAt: string;
    updatedAt: string;
}

function adaptReport(b: BackendReport): Report {
    const primaryRef = b.externalReferences[0];
    return {
        id: b.id,
        name: b.name,
        description: b.description ?? null,
        entityType: 'report',
        tlp: b.tlp,
        confidence: b.confidence ?? null,
        createdBy: primaryRef?.sourceName ?? null,
        source: primaryRef?.sourceName ?? null,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
    };
}

function adaptReportDetail(b: BackendReport): ReportDetailEntity {
    return {
        ...adaptReport(b),
        published: b.published,
        reportTypes: b.reportTypes,
        objectRefs: b.objectRefs,
        revoked: b.revoked,
        externalReferences: b.externalReferences,
    };
}

export async function fetchReports(
    filters: ReportFilters & { limit?: number },
): Promise<PaginatedResponse<Report>> {
    const params = new URLSearchParams();
    if (filters.name) params.set('name', filters.name);
    if (filters.tlp) params.set('tlp', filters.tlp);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));

    const qs = params.toString();
    const raw = await apiFetch<PaginatedResponse<BackendReport>>(
        `/reports${qs ? `?${qs}` : ''}`,
    );

    return {
        data: raw.data.map(adaptReport),
        meta: raw.meta,
    };
}

export async function fetchReportDetail(id: string): Promise<ReportDetail> {
    const raw = await apiFetch<{
        entity: BackendReport;
        relatedObjects: Array<{
            relationship: RelatedObjectItem['relationship'];
            object: StixObject | null;
        }>;
        sightings: SightingItem[];
        objectRefs: StixObject[];
    }>(`/reports/${encodeURIComponent(id)}`);

    return {
        entity: adaptReportDetail({
            ...raw.entity,
            objectRefs: raw.objectRefs ?? [],
        }),
        relatedObjects: raw.relatedObjects,
        sightings: raw.sightings,
    };
}
