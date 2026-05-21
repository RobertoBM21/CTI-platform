import { useQuery } from '@tanstack/react-query';
import { fetchIntrusionSetDetail } from '../api/intrusion-sets.api';

export function useIntrusionSetDetail(id: string) {
    return useQuery({
        queryKey: ['intrusion-sets', id, 'detail'],
        queryFn: () => fetchIntrusionSetDetail(id),
        enabled: Boolean(id),
    });
}
