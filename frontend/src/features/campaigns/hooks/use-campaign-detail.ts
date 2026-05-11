import { useQuery } from '@tanstack/react-query';
import { fetchCampaignDetail } from '../api/campaigns.api';

export function useCampaignDetail(id: string) {
    return useQuery({
        queryKey: ['campaigns', id, 'detail'],
        queryFn: () => fetchCampaignDetail(id),
        enabled: Boolean(id),
    });
}
