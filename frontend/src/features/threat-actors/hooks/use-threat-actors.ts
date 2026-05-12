import { useQuery } from '@tanstack/react-query';
import { fetchThreatActors } from '../api/threat-actors.api';
import type { ThreatActorFilters } from '../types';

export const THREAT_ACTORS_PAGE_SIZE = 3;

export function useThreatActors(
    search: string,
    filters: ThreatActorFilters,
    page: number,
) {
    return useQuery({
        queryKey: ['threat-actors', { search, ...filters, page }],
        queryFn: () =>
            fetchThreatActors({
                name: search || undefined,
                tlp: filters.tlp,
                sortOrder: filters.sortOrder,
                page,
                limit: THREAT_ACTORS_PAGE_SIZE,
            }),
    });
}
