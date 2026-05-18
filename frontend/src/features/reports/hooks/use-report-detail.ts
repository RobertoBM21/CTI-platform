import { useQuery } from '@tanstack/react-query';
import { fetchReportDetail } from '../api/reports.api';

export function useReportDetail(id: string) {
    return useQuery({
        queryKey: ['reports', id, 'detail'],
        queryFn: () => fetchReportDetail(id),
        enabled: Boolean(id),
    });
}
