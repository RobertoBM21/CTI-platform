import { useQuery } from '@tanstack/react-query';
import { fetchIncidentDetail } from '../api/incidents.api';

export function useIncidentDetail(id: string) {
    return useQuery({
        queryKey: ['incidents', id, 'detail'],
        queryFn: () => fetchIncidentDetail(id),
        enabled: Boolean(id),
    });
}
