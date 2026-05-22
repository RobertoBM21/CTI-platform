import {
    fetchCampaignDetail,
    fetchCampaigns,
} from '@/features/campaigns/api/campaigns.api';
import {
    fetchIncidentDetail,
    fetchIncidents,
} from '@/features/incidents/api/incidents.api';
import {
    fetchThreatActorDetail,
    fetchThreatActors,
} from '@/features/threat-actors/api/threat-actors.api';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats, fetchLocations } from '../api/dashboard.api';

const DASHBOARD_MAX_LIMIT = 100;

export const dashboardQueryKeys = {
    stats: ['dashboard', 'stats'] as const,
    locations: ['dashboard', 'locations'] as const,
    topCampaigns: ['dashboard', 'top-campaigns'] as const,
    topIncidents: ['dashboard', 'top-incidents'] as const,
    threatActorsPage: (page: number) =>
        ['dashboard', 'threat-actors', page] as const,
    campaignsPage: (page: number) => ['dashboard', 'campaigns', page] as const,
    incidentsPage: (page: number) => ['dashboard', 'incidents', page] as const,
    threatActorDetail: (id: string | null) =>
        ['dashboard', 'threat-actor-detail', id] as const,
    campaignDetail: (id: string | null) =>
        ['dashboard', 'campaign-detail', id] as const,
    incidentDetail: (id: string | null) =>
        ['dashboard', 'incident-detail', id] as const,
    allThreatActors: ['dashboard', 'all-threat-actors'] as const,
    allCampaigns: ['dashboard', 'all-campaigns'] as const,
    allIncidents: ['dashboard', 'all-incidents'] as const,
    signalFeed: ['dashboard', 'signal-feed'] as const,
    alertVolume: ['dashboard', 'alert-volume'] as const,
};

// ── Aggregate stats (totals) ────────────────────────────────────────────

export function useDashboardStats() {
    return useQuery({
        queryKey: dashboardQueryKeys.stats,
        queryFn: fetchDashboardStats,
    });
}

// ── Locations for map ──────────────────────────────────────────────────

export function useLocations() {
    return useQuery({
        queryKey: dashboardQueryKeys.locations,
        queryFn: () => fetchLocations(DASHBOARD_MAX_LIMIT),
    });
}

// ── Top 10 by confidence ───────────────────────────────────────────────

export function useTopCampaigns() {
    return useQuery({
        queryKey: dashboardQueryKeys.topCampaigns,
        queryFn: () =>
            fetchCampaigns({ limit: DASHBOARD_MAX_LIMIT, sortOrder: 'desc' }),
    });
}

export function useTopIncidents() {
    return useQuery({
        queryKey: dashboardQueryKeys.topIncidents,
        queryFn: () =>
            fetchIncidents({ limit: DASHBOARD_MAX_LIMIT, sortOrder: 'desc' }),
    });
}

// ── Threat domain quick tables ─────────────────────────────────────────

export function useDashboardThreatActors(page: number) {
    return useQuery({
        queryKey: dashboardQueryKeys.threatActorsPage(page),
        queryFn: () => fetchThreatActors({ limit: 5, page }),
    });
}

export function useDashboardCampaigns(page: number) {
    return useQuery({
        queryKey: dashboardQueryKeys.campaignsPage(page),
        queryFn: () => fetchCampaigns({ limit: 5, page }),
    });
}

export function useDashboardIncidents(page: number) {
    return useQuery({
        queryKey: dashboardQueryKeys.incidentsPage(page),
        queryFn: () => fetchIncidents({ limit: 5, page }),
    });
}

// ── Selected entity details ────────────────────────────────────────────

export function useSelectedThreatActorDetail(id: string | null) {
    return useQuery({
        queryKey: dashboardQueryKeys.threatActorDetail(id),
        queryFn: () => fetchThreatActorDetail(id!),
        enabled: Boolean(id),
    });
}

export function useSelectedCampaignDetail(id: string | null) {
    return useQuery({
        queryKey: dashboardQueryKeys.campaignDetail(id),
        queryFn: () => fetchCampaignDetail(id!),
        enabled: Boolean(id),
    });
}

export function useSelectedIncidentDetail(id: string | null) {
    return useQuery({
        queryKey: dashboardQueryKeys.incidentDetail(id),
        queryFn: () => fetchIncidentDetail(id!),
        enabled: Boolean(id),
    });
}

// ── All entities for selectors ─────────────────────────────────────────

export function useAllThreatActorsForSelect() {
    return useQuery({
        queryKey: dashboardQueryKeys.allThreatActors,
        queryFn: () =>
            fetchThreatActors({ limit: DASHBOARD_MAX_LIMIT, sortOrder: 'asc' }),
    });
}

export function useAllCampaignsForSelect() {
    return useQuery({
        queryKey: dashboardQueryKeys.allCampaigns,
        queryFn: () =>
            fetchCampaigns({ limit: DASHBOARD_MAX_LIMIT, sortOrder: 'asc' }),
    });
}

export function useAllIncidentsForSelect() {
    return useQuery({
        queryKey: dashboardQueryKeys.allIncidents,
        queryFn: () =>
            fetchIncidents({ limit: DASHBOARD_MAX_LIMIT, sortOrder: 'asc' }),
    });
}

// ── Signal feed (recent activity) ─────────────────────────────────────

export function useSignalFeed() {
    return useQuery({
        queryKey: dashboardQueryKeys.signalFeed,
        queryFn: () => fetchIncidents({ limit: 8, sortOrder: 'desc' }),
    });
}

// ── Alert volume (recent incidents for monthly grouping) ──────────────

export function useAlertVolume() {
    return useQuery({
        queryKey: dashboardQueryKeys.alertVolume,
        queryFn: async () => {
            const firstPage = await fetchIncidents({
                page: 1,
                limit: DASHBOARD_MAX_LIMIT,
                sortOrder: 'asc',
            });

            const totalPages = firstPage.meta.totalPages;
            if (totalPages <= 1) return firstPage;

            const restPages = await Promise.all(
                Array.from({ length: totalPages - 1 }, (_, idx) =>
                    fetchIncidents({
                        page: idx + 2,
                        limit: DASHBOARD_MAX_LIMIT,
                        sortOrder: 'asc',
                    }),
                ),
            );

            return {
                data: [
                    ...firstPage.data,
                    ...restPages.flatMap((page) => page.data),
                ],
                meta: {
                    ...firstPage.meta,
                    totalPages,
                    page: 1,
                    limit: firstPage.meta.total,
                },
            };
        },
    });
}
