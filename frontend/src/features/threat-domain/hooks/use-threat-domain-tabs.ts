'use client';

import { fetchCampaigns } from '@/features/campaigns/api/campaigns.api';
import { fetchIncidents } from '@/features/incidents/api/incidents.api';
import { fetchThreatActors } from '@/features/threat-actors/api/threat-actors.api';
import type { BaseCatalogFilters } from '@/shared/types/entity';
import { useQuery } from '@tanstack/react-query';
import {
    fetchAttackPatterns,
    fetchIntrusionSets,
} from '../api/threat-domain.api';
import type { AttackPatternFilters } from '../types';

const ALL_PREVIEW_LIMIT = 100;
const ITEMS_PAGE_SIZE = 3;
// Attack patterns render in a dense table, so this tab intentionally uses a larger page size.
const ATTACK_PATTERNS_TABLE_PAGE_SIZE = 10;

// ── All-tab multi-fetch ────────────────────────────────────────────────

interface AllTabParams {
    attackPatternId?: string;
    page: number;
}

export function useAllTabData({ attackPatternId, page }: AllTabParams) {
    return useQuery({
        queryKey: ['threat-domain', 'all', { attackPatternId, page }],
        queryFn: async () => {
            const [incidents, campaigns, threatActors] = await Promise.all([
                fetchIncidents({
                    limit: ALL_PREVIEW_LIMIT,
                    page,
                    attackPatternId,
                }),
                fetchCampaigns({
                    limit: ALL_PREVIEW_LIMIT,
                    page,
                    attackPatternId,
                }),
                fetchThreatActors({
                    limit: ALL_PREVIEW_LIMIT,
                    page,
                    attackPatternId,
                }),
            ]);
            return { incidents, campaigns, threatActors };
        },
    });
}

// ── Incidents tab ──────────────────────────────────────────────────────

interface IncidentsTabParams {
    search: string;
    filters: BaseCatalogFilters;
    page: number;
    attackPatternId?: string;
}

export function useIncidentsTab({
    search,
    filters,
    page,
    attackPatternId,
}: IncidentsTabParams) {
    return useQuery({
        queryKey: [
            'threat-domain',
            'incidents',
            { search, ...filters, page, attackPatternId },
        ],
        queryFn: () =>
            fetchIncidents({
                name: search || undefined,
                tlp: filters.tlp,
                sortOrder: filters.sortOrder,
                page,
                limit: ITEMS_PAGE_SIZE,
                attackPatternId,
            }),
    });
}

// ── Campaigns tab ──────────────────────────────────────────────────────

interface CampaignsTabParams {
    search: string;
    filters: BaseCatalogFilters;
    page: number;
    attackPatternId?: string;
    intrusionSetId?: string;
}

export function useCampaignsTab({
    search,
    filters,
    page,
    attackPatternId,
    intrusionSetId,
}: CampaignsTabParams) {
    return useQuery({
        queryKey: [
            'threat-domain',
            'campaigns',
            { search, ...filters, page, attackPatternId, intrusionSetId },
        ],
        queryFn: () =>
            fetchCampaigns({
                name: search || undefined,
                tlp: filters.tlp,
                sortOrder: filters.sortOrder,
                page,
                limit: ITEMS_PAGE_SIZE,
                attackPatternId,
                intrusionSetId,
            }),
    });
}

// ── Threat Actors tab ──────────────────────────────────────────────────

interface ThreatActorsTabParams {
    search: string;
    filters: BaseCatalogFilters;
    page: number;
    attackPatternId?: string;
    intrusionSetId?: string;
}

export function useThreatActorsTab({
    search,
    filters,
    page,
    attackPatternId,
    intrusionSetId,
}: ThreatActorsTabParams) {
    return useQuery({
        queryKey: [
            'threat-domain',
            'threat-actors',
            { search, ...filters, page, attackPatternId, intrusionSetId },
        ],
        queryFn: () =>
            fetchThreatActors({
                name: search || undefined,
                tlp: filters.tlp,
                sortOrder: filters.sortOrder,
                page,
                limit: ITEMS_PAGE_SIZE,
                attackPatternId,
                intrusionSetId,
            }),
    });
}

// ── Attack Patterns tab ────────────────────────────────────────────────

interface AttackPatternsTabParams {
    search: string;
    filters: AttackPatternFilters;
    page: number;
}

export function useAttackPatternsTab({
    search,
    filters,
    page,
}: AttackPatternsTabParams) {
    return useQuery({
        queryKey: [
            'threat-domain',
            'attack-patterns',
            { search, ...filters, page },
        ],
        queryFn: () =>
            fetchAttackPatterns({
                name: search || undefined,
                tlp: filters.tlp,
                sortOrder: filters.sortOrder,
                page,
                limit: ATTACK_PATTERNS_TABLE_PAGE_SIZE,
            }),
    });
}

// ── Intrusion Sets dropdown ────────────────────────────────────────────

export function useIntrusionSetsDropdown() {
    return useQuery({
        queryKey: ['intrusion-sets', 'dropdown'],
        queryFn: () => fetchIntrusionSets({ page: 1, limit: 500 }),
        staleTime: 5 * 60 * 1000,
    });
}

// ── Threat Domain counts (for tab badges) ─────────────────────────────

interface ThreatDomainCountsParams {
    attackPatternId?: string;
    campaignIntrusionSetId?: string;
    threatActorIntrusionSetId?: string;
    incidentsTlp?: string;
    campaignsTlp?: string;
    threatActorsTlp?: string;
    attackPatternsTlp?: string;
}

export function useThreatDomainCounts(params?: ThreatDomainCountsParams) {
    const attackPatternId = params?.attackPatternId;
    const campaignIntrusionSetId = params?.campaignIntrusionSetId;
    const threatActorIntrusionSetId = params?.threatActorIntrusionSetId;
    const incidentsTlp = params?.incidentsTlp;
    const campaignsTlp = params?.campaignsTlp;
    const threatActorsTlp = params?.threatActorsTlp;
    const attackPatternsTlp = params?.attackPatternsTlp;
    return useQuery({
        queryKey: [
            'threat-domain',
            'counts',
            {
                attackPatternId,
                campaignIntrusionSetId,
                threatActorIntrusionSetId,
                incidentsTlp,
                campaignsTlp,
                threatActorsTlp,
                attackPatternsTlp,
            },
        ],
        queryFn: async () => {
            const [incidents, campaigns, threatActors, attackPatterns] =
                await Promise.all([
                    fetchIncidents({
                        page: 1,
                        limit: 1,
                        attackPatternId,
                        tlp: incidentsTlp as Parameters<
                            typeof fetchIncidents
                        >[0]['tlp'],
                    }),
                    fetchCampaigns({
                        page: 1,
                        limit: 1,
                        attackPatternId,
                        intrusionSetId: campaignIntrusionSetId,
                        tlp: campaignsTlp as Parameters<
                            typeof fetchCampaigns
                        >[0]['tlp'],
                    }),
                    fetchThreatActors({
                        page: 1,
                        limit: 1,
                        attackPatternId,
                        intrusionSetId: threatActorIntrusionSetId,
                        tlp: threatActorsTlp as Parameters<
                            typeof fetchThreatActors
                        >[0]['tlp'],
                    }),
                    fetchAttackPatterns({
                        page: 1,
                        limit: 1,
                        tlp: attackPatternsTlp as Parameters<
                            typeof fetchAttackPatterns
                        >[0]['tlp'],
                    }),
                ]);
            return {
                incidents: incidents.meta.total,
                campaigns: campaigns.meta.total,
                threatActors: threatActors.meta.total,
                attackPatterns: attackPatterns.meta.total,
                all:
                    incidents.meta.total +
                    campaigns.meta.total +
                    threatActors.meta.total,
            };
        },
        staleTime: 60 * 1000,
    });
}
