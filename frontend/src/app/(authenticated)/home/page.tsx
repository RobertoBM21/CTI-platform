import { Dashboard } from '@/features/dashboard';
import { dashboardQueryKeys } from '@/features/dashboard/hooks/use-dashboard';
import type { LocationItem } from '@/features/dashboard/types';
import type { PaginatedResponse } from '@/lib/api-client';
import type { CatalogEntity, StixExternalRef } from '@/shared/types/entity';
import type { EntityType } from '@/shared/types/enums';
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from '@tanstack/react-query';
import { cookies } from 'next/headers';
import { Suspense } from 'react';

interface BackendCatalogEntity {
    id: string;
    name: string;
    description?: string;
    confidence?: number;
    tlp?: string;
    createdAt: string;
    updatedAt: string;
    externalReferences?: StixExternalRef[];
}

interface DashboardStats {
    totalIncidents: number;
    totalCampaigns: number;
    totalThreatActors: number;
}
const DASHBOARD_MAX_LIMIT = 100;

function getApiBaseUrl(): string {
    return process.env['API_URL'] ?? 'http://localhost:3000';
}

async function serverApiFetch<T>(path: string): Promise<T> {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    const res = await fetch(`${getApiBaseUrl()}${path}`, {
        cache: 'no-store',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (!res.ok) {
        throw new Error(`API error ${res.status}: ${res.statusText}`);
    }

    return res.json() as Promise<T>;
}

function adaptCatalogEntity(
    raw: BackendCatalogEntity,
    entityType: EntityType,
): CatalogEntity {
    const primaryRef = raw.externalReferences?.[0];
    return {
        id: raw.id,
        name: raw.name,
        description: raw.description ?? null,
        entityType,
        tlp: (raw.tlp as CatalogEntity['tlp']) ?? 'clear',
        confidence: raw.confidence ?? null,
        createdBy: primaryRef?.sourceName ?? null,
        source: primaryRef?.sourceName ?? null,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
    };
}

async function fetchCatalogOnServer(
    path: string,
    entityType: EntityType,
): Promise<PaginatedResponse<CatalogEntity>> {
    const raw =
        await serverApiFetch<PaginatedResponse<BackendCatalogEntity>>(path);

    return {
        data: raw.data.map((item) => adaptCatalogEntity(item, entityType)),
        meta: raw.meta,
    };
}

async function fetchDashboardStatsOnServer(): Promise<DashboardStats> {
    const [incidentsRes, campaignsRes, threatActorsRes] = await Promise.all([
        fetchCatalogOnServer('/incidents?limit=1', 'incident'),
        fetchCatalogOnServer('/campaigns?limit=1', 'campaign'),
        fetchCatalogOnServer('/threat-actors?limit=1', 'threat-actor'),
    ]);

    return {
        totalIncidents: incidentsRes.meta.total,
        totalCampaigns: campaignsRes.meta.total,
        totalThreatActors: threatActorsRes.meta.total,
    };
}

export default async function HomePage() {
    const queryClient = new QueryClient();

    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: dashboardQueryKeys.stats,
            queryFn: fetchDashboardStatsOnServer,
        }),
        queryClient.prefetchQuery({
            queryKey: dashboardQueryKeys.locations,
            queryFn: () =>
                serverApiFetch<PaginatedResponse<LocationItem>>(
                    `/locations?limit=${DASHBOARD_MAX_LIMIT}&sortOrder=asc`,
                ),
        }),
        queryClient.prefetchQuery({
            queryKey: dashboardQueryKeys.topCampaigns,
            queryFn: () =>
                fetchCatalogOnServer(
                    `/campaigns?limit=${DASHBOARD_MAX_LIMIT}&sortOrder=desc`,
                    'campaign',
                ),
        }),
        queryClient.prefetchQuery({
            queryKey: dashboardQueryKeys.topIncidents,
            queryFn: () =>
                fetchCatalogOnServer(
                    `/incidents?limit=${DASHBOARD_MAX_LIMIT}&sortOrder=desc`,
                    'incident',
                ),
        }),
        queryClient.prefetchQuery({
            queryKey: dashboardQueryKeys.signalFeed,
            queryFn: () =>
                fetchCatalogOnServer(
                    '/incidents?limit=8&sortOrder=desc',
                    'incident',
                ),
        }),
        queryClient.prefetchQuery({
            queryKey: dashboardQueryKeys.alertVolume,
            queryFn: () =>
                fetchCatalogOnServer(
                    `/incidents?limit=${DASHBOARD_MAX_LIMIT}&sortOrder=asc`,
                    'incident',
                ),
        }),
        queryClient.prefetchQuery({
            queryKey: dashboardQueryKeys.threatActorsPage(1),
            queryFn: () =>
                fetchCatalogOnServer(
                    '/threat-actors?limit=5&page=1',
                    'threat-actor',
                ),
        }),
        queryClient.prefetchQuery({
            queryKey: dashboardQueryKeys.campaignsPage(1),
            queryFn: () =>
                fetchCatalogOnServer('/campaigns?limit=5&page=1', 'campaign'),
        }),
        queryClient.prefetchQuery({
            queryKey: dashboardQueryKeys.incidentsPage(1),
            queryFn: () =>
                fetchCatalogOnServer('/incidents?limit=5&page=1', 'incident'),
        }),
        queryClient.prefetchQuery({
            queryKey: dashboardQueryKeys.allThreatActors,
            queryFn: () =>
                fetchCatalogOnServer(
                    `/threat-actors?limit=${DASHBOARD_MAX_LIMIT}&sortOrder=asc`,
                    'threat-actor',
                ),
        }),
        queryClient.prefetchQuery({
            queryKey: dashboardQueryKeys.allCampaigns,
            queryFn: () =>
                fetchCatalogOnServer(
                    `/campaigns?limit=${DASHBOARD_MAX_LIMIT}&sortOrder=asc`,
                    'campaign',
                ),
        }),
        queryClient.prefetchQuery({
            queryKey: dashboardQueryKeys.allIncidents,
            queryFn: () =>
                fetchCatalogOnServer(
                    `/incidents?limit=${DASHBOARD_MAX_LIMIT}&sortOrder=asc`,
                    'incident',
                ),
        }),
    ]);

    return (
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <HydrationBoundary state={dehydrate(queryClient)}>
                <Suspense>
                    <Dashboard />
                </Suspense>
            </HydrationBoundary>
        </main>
    );
}
