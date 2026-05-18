import { useQuery } from '@tanstack/react-query';
import {
    fetchAttackPatterns,
    fetchIntrusionSets,
} from '../api/threat-domain.api';
import type { AttackPatternFilters, IntrusionSetFilters } from '../types';

export const ATTACK_PATTERNS_PAGE_SIZE = 10;
export const INTRUSION_SETS_PAGE_SIZE = 100;

export function useAttackPatterns(
    search: string,
    filters: AttackPatternFilters,
    page: number,
) {
    return useQuery({
        queryKey: ['attack-patterns', { search, ...filters, page }],
        queryFn: () =>
            fetchAttackPatterns({
                name: search || undefined,
                tlp: filters.tlp,
                sortOrder: filters.sortOrder,
                page,
                limit: ATTACK_PATTERNS_PAGE_SIZE,
            }),
    });
}

export function useIntrusionSets(
    search: string,
    filters: IntrusionSetFilters,
    page: number,
) {
    return useQuery({
        queryKey: ['intrusion-sets', { search, ...filters, page }],
        queryFn: () =>
            fetchIntrusionSets({
                name: search || undefined,
                tlp: filters.tlp,
                sortOrder: filters.sortOrder,
                page,
                limit: INTRUSION_SETS_PAGE_SIZE,
            }),
    });
}

/** Fetch all intrusion sets for use in dropdowns — no pagination needed */
export function useIntrusionSetsAll() {
    return useQuery({
        queryKey: ['intrusion-sets', 'all'],
        queryFn: () =>
            fetchIntrusionSets({
                page: 1,
                limit: 500,
            }),
        staleTime: 5 * 60 * 1000,
    });
}
