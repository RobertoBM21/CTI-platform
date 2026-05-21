import { useQuery } from '@tanstack/react-query';
import { fetchToolDetail } from '../api/tools.api';

export function useToolDetail(id: string) {
    return useQuery({
        queryKey: ['tools', id, 'detail'],
        queryFn: () => fetchToolDetail(id),
        enabled: Boolean(id),
    });
}
