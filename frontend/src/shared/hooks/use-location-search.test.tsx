import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useLocationSearch } from './use-location-search';

describe('useLocationSearch', () => {
    it('returns current location.search after mount', async () => {
        window.history.pushState({}, '', '/home?tab=overview');

        const { result } = renderHook(() => useLocationSearch());

        await waitFor(() => {
            expect(result.current).toBe('?tab=overview');
        });
    });

    it('updates search when popstate is dispatched', async () => {
        window.history.pushState({}, '', '/home?tab=overview');
        const { result } = renderHook(() => useLocationSearch());

        await waitFor(() => {
            expect(result.current).toBe('?tab=overview');
        });

        act(() => {
            window.history.pushState({}, '', '/home?tab=analysis');
            window.dispatchEvent(new PopStateEvent('popstate'));
        });

        await waitFor(() => {
            expect(result.current).toBe('?tab=analysis');
        });
    });

    it('updates search when window gains focus', async () => {
        window.history.pushState({}, '', '/home?tab=overview');
        const { result } = renderHook(() => useLocationSearch());

        await waitFor(() => {
            expect(result.current).toBe('?tab=overview');
        });

        act(() => {
            window.history.pushState({}, '', '/home?tab=timeline');
            window.dispatchEvent(new Event('focus'));
        });

        await waitFor(() => {
            expect(result.current).toBe('?tab=timeline');
        });
    });
});
