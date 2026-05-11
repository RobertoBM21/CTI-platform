import { useQuery } from '@tanstack/react-query';
import { fetchCampaigns } from '../api/campaigns.api';
import type { CampaignFilters } from '../types';

export const CAMPAIGNS_PAGE_SIZE = 3;

export function useCampaigns(
    search: string,
    filters: CampaignFilters,
    page: number,
) {
    return useQuery({
        queryKey: ['campaigns', { search, ...filters, page }],
        queryFn: () =>
            fetchCampaigns({
                name: search || undefined,
                tlp: filters.tlp,
                sortOrder: filters.sortOrder,
                page,
                limit: CAMPAIGNS_PAGE_SIZE,
            }),
    });
}
