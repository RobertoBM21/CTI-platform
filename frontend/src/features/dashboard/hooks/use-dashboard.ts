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

// ── Aggregate stats (totals) ────────────────────────────────────────────

export function useDashboardStats() {
    return useQuery({
        queryKey: ['dashboard', 'stats'],
        queryFn: fetchDashboardStats,
    });
}

// ── Locations for map ──────────────────────────────────────────────────

export function useLocations() {
    return useQuery({
        queryKey: ['dashboard', 'locations'],
        queryFn: () => fetchLocations(200),
    });
}

// ── Top 10 by confidence ───────────────────────────────────────────────

export function useTopCampaigns() {
    return useQuery({
        queryKey: ['dashboard', 'top-campaigns'],
        queryFn: () => fetchCampaigns({ limit: 10, sortOrder: 'desc' }),
    });
}

export function useTopIncidents() {
    return useQuery({
        queryKey: ['dashboard', 'top-incidents'],
        queryFn: () => fetchIncidents({ limit: 10, sortOrder: 'desc' }),
    });
}

// ── Threat domain quick tables ─────────────────────────────────────────

export function useDashboardThreatActors(page: number) {
    return useQuery({
        queryKey: ['dashboard', 'threat-actors', page],
        queryFn: () => fetchThreatActors({ limit: 5, page }),
    });
}

export function useDashboardCampaigns(page: number) {
    return useQuery({
        queryKey: ['dashboard', 'campaigns', page],
        queryFn: () => fetchCampaigns({ limit: 5, page }),
    });
}

export function useDashboardIncidents(page: number) {
    return useQuery({
        queryKey: ['dashboard', 'incidents', page],
        queryFn: () => fetchIncidents({ limit: 5, page }),
    });
}

// ── Selected entity details ────────────────────────────────────────────

export function useSelectedThreatActorDetail(id: string | null) {
    return useQuery({
        queryKey: ['dashboard', 'threat-actor-detail', id],
        queryFn: () => fetchThreatActorDetail(id!),
        enabled: Boolean(id),
    });
}

export function useSelectedCampaignDetail(id: string | null) {
    return useQuery({
        queryKey: ['dashboard', 'campaign-detail', id],
        queryFn: () => fetchCampaignDetail(id!),
        enabled: Boolean(id),
    });
}

export function useSelectedIncidentDetail(id: string | null) {
    return useQuery({
        queryKey: ['dashboard', 'incident-detail', id],
        queryFn: () => fetchIncidentDetail(id!),
        enabled: Boolean(id),
    });
}

// ── All entities for selectors ─────────────────────────────────────────

export function useAllThreatActorsForSelect() {
    return useQuery({
        queryKey: ['dashboard', 'all-threat-actors'],
        queryFn: () => fetchThreatActors({ limit: 100, sortOrder: 'asc' }),
    });
}

export function useAllCampaignsForSelect() {
    return useQuery({
        queryKey: ['dashboard', 'all-campaigns'],
        queryFn: () => fetchCampaigns({ limit: 100, sortOrder: 'asc' }),
    });
}

export function useAllIncidentsForSelect() {
    return useQuery({
        queryKey: ['dashboard', 'all-incidents'],
        queryFn: () => fetchIncidents({ limit: 100, sortOrder: 'asc' }),
    });
}

// ── Signal feed (recent activity) ─────────────────────────────────────

export function useSignalFeed() {
    return useQuery({
        queryKey: ['dashboard', 'signal-feed'],
        queryFn: () => fetchIncidents({ limit: 8, sortOrder: 'desc' }),
    });
}

// ── Alert volume (recent incidents for monthly grouping) ──────────────

export function useAlertVolume() {
    return useQuery({
        queryKey: ['dashboard', 'alert-volume'],
        queryFn: () => fetchIncidents({ limit: 50, sortOrder: 'asc' }),
    });
}
