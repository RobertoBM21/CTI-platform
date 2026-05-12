import { useQuery } from '@tanstack/react-query';
import { fetchThreatActorDetail } from '../api/threat-actors.api';

export function useThreatActorDetail(id: string) {
    return useQuery({
        queryKey: ['threat-actors', id, 'detail'],
        queryFn: () => fetchThreatActorDetail(id),
        enabled: Boolean(id),
    });
}
