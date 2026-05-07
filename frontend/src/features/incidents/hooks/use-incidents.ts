import { useQuery } from '@tanstack/react-query';
import { fetchIncidents } from '../api/incidents.api';
import type { IncidentFilters } from '../types';

export const INCIDENTS_PAGE_SIZE = 3;

export function useIncidents(
    search: string,
    filters: IncidentFilters,
    page: number,
) {
    return useQuery({
        queryKey: ['incidents', { search, ...filters, page }],
        queryFn: () =>
            fetchIncidents({
                name: search || undefined,
                tlp: filters.tlp,
                sortOrder: filters.sortOrder,
                page,
                limit: INCIDENTS_PAGE_SIZE,
            }),
    });
}
