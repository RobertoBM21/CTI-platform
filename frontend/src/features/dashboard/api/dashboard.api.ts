import { fetchCampaigns } from '@/features/campaigns/api/campaigns.api';
import { fetchIncidents } from '@/features/incidents/api/incidents.api';
import { fetchThreatActors } from '@/features/threat-actors/api/threat-actors.api';
import { apiFetch, type PaginatedResponse } from '@/lib/api-client';
import type { DashboardStats, LocationItem } from '../types';

export async function fetchDashboardStats(): Promise<DashboardStats> {
    const [incidentsRes, campaignsRes, threatActorsRes] = await Promise.all([
        fetchIncidents({ limit: 1 }),
        fetchCampaigns({ limit: 1 }),
        fetchThreatActors({ limit: 1 }),
    ]);

    return {
        totalIncidents: incidentsRes.meta.total,
        totalCampaigns: campaignsRes.meta.total,
        totalThreatActors: threatActorsRes.meta.total,
    };
}

export async function fetchLocations(
    limit = 200,
): Promise<PaginatedResponse<LocationItem>> {
    return apiFetch<PaginatedResponse<LocationItem>>(
        `/locations?limit=${limit}&sortOrder=asc`,
    );
}
