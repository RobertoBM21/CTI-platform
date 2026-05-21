'use client';

import { fetchIntrusionSets } from '@/features/intrusion-sets/api/intrusion-sets.api';
import { fetchMalwares } from '@/features/malware/api/malware.api';
import { fetchTools } from '@/features/tools/api/tools.api';
import { fetchVulnerabilities } from '@/features/vulnerabilities/api/vulnerabilities.api';
import type { BaseCatalogFilters } from '@/shared/types/entity';
import { useQuery } from '@tanstack/react-query';

const ALL_PREVIEW_LIMIT = 100;
const ITEMS_PAGE_SIZE = 10;

interface CyberTabParams {
    search: string;
    filters: BaseCatalogFilters;
    page: number;
}

export function useAllCyberTabData(page: number) {
    return useQuery({
        queryKey: ['cyber-domain', 'all', page],
        queryFn: async () => {
            const [malware, tools, vulnerabilities, intrusionSets] =
                await Promise.all([
                    fetchMalwares({
                        page,
                        limit: ALL_PREVIEW_LIMIT,
                    }),
                    fetchTools({
                        page,
                        limit: ALL_PREVIEW_LIMIT,
                    }),
                    fetchVulnerabilities({
                        page,
                        limit: ALL_PREVIEW_LIMIT,
                    }),
                    fetchIntrusionSets({
                        page,
                        limit: ALL_PREVIEW_LIMIT,
                    }),
                ]);

            return { malware, tools, vulnerabilities, intrusionSets };
        },
    });
}

export function useMalwareCyberTab({ search, filters, page }: CyberTabParams) {
    return useQuery({
        queryKey: ['cyber-domain', 'malware', { search, ...filters, page }],
        queryFn: () =>
            fetchMalwares({
                name: search || undefined,
                tlp: filters.tlp,
                sortOrder: filters.sortOrder,
                page,
                limit: ITEMS_PAGE_SIZE,
            }),
    });
}

export function useToolsCyberTab({ search, filters, page }: CyberTabParams) {
    return useQuery({
        queryKey: ['cyber-domain', 'tools', { search, ...filters, page }],
        queryFn: () =>
            fetchTools({
                name: search || undefined,
                tlp: filters.tlp,
                sortOrder: filters.sortOrder,
                page,
                limit: ITEMS_PAGE_SIZE,
            }),
    });
}

export function useVulnerabilitiesCyberTab({
    search,
    filters,
    page,
}: CyberTabParams) {
    return useQuery({
        queryKey: [
            'cyber-domain',
            'vulnerabilities',
            { search, ...filters, page },
        ],
        queryFn: () =>
            fetchVulnerabilities({
                name: search || undefined,
                tlp: filters.tlp,
                sortOrder: filters.sortOrder,
                page,
                limit: ITEMS_PAGE_SIZE,
            }),
    });
}

export function useIntrusionSetsCyberTab({
    search,
    filters,
    page,
}: CyberTabParams) {
    return useQuery({
        queryKey: [
            'cyber-domain',
            'intrusion-sets',
            { search, ...filters, page },
        ],
        queryFn: () =>
            fetchIntrusionSets({
                name: search || undefined,
                tlp: filters.tlp,
                sortOrder: filters.sortOrder,
                page,
                limit: ITEMS_PAGE_SIZE,
            }),
    });
}

interface CyberDomainCountsParams {
    malwareTlp?: string;
    toolsTlp?: string;
    vulnerabilitiesTlp?: string;
    intrusionSetsTlp?: string;
}

export function useCyberDomainCounts(params?: CyberDomainCountsParams) {
    const malwareTlp = params?.malwareTlp;
    const toolsTlp = params?.toolsTlp;
    const vulnerabilitiesTlp = params?.vulnerabilitiesTlp;
    const intrusionSetsTlp = params?.intrusionSetsTlp;

    return useQuery({
        queryKey: [
            'cyber-domain',
            'counts',
            { malwareTlp, toolsTlp, vulnerabilitiesTlp, intrusionSetsTlp },
        ],
        queryFn: async () => {
            const [malware, tools, vulnerabilities, intrusionSets] =
                await Promise.all([
                    fetchMalwares({
                        page: 1,
                        limit: 1,
                        tlp: malwareTlp as Parameters<
                            typeof fetchMalwares
                        >[0]['tlp'],
                    }),
                    fetchTools({
                        page: 1,
                        limit: 1,
                        tlp: toolsTlp as Parameters<
                            typeof fetchTools
                        >[0]['tlp'],
                    }),
                    fetchVulnerabilities({
                        page: 1,
                        limit: 1,
                        tlp: vulnerabilitiesTlp as Parameters<
                            typeof fetchVulnerabilities
                        >[0]['tlp'],
                    }),
                    fetchIntrusionSets({
                        page: 1,
                        limit: 1,
                        tlp: intrusionSetsTlp as Parameters<
                            typeof fetchIntrusionSets
                        >[0]['tlp'],
                    }),
                ]);

            return {
                malware: malware.meta.total,
                tools: tools.meta.total,
                vulnerabilities: vulnerabilities.meta.total,
                intrusionSets: intrusionSets.meta.total,
                all:
                    malware.meta.total +
                    tools.meta.total +
                    vulnerabilities.meta.total +
                    intrusionSets.meta.total,
            };
        },
        staleTime: 60 * 1000,
    });
}
