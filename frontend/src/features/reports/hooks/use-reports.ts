import { useQuery } from '@tanstack/react-query';
import { fetchReports } from '../api/reports.api';
import type { ReportFilters } from '../types';

export const REPORTS_PAGE_SIZE = 3;

export function useReports(
    search: string,
    filters: ReportFilters,
    page: number,
) {
    return useQuery({
        queryKey: ['reports', { search, ...filters, page }],
        queryFn: () =>
            fetchReports({
                name: search || undefined,
                tlp: filters.tlp,
                sortOrder: filters.sortOrder,
                page,
                limit: REPORTS_PAGE_SIZE,
            }),
    });
}
