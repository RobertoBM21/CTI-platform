import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDetailTab } from './use-detail-tab';

const replaceMock = vi.fn();
let currentSearch = '';

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        replace: replaceMock,
    }),
    useSearchParams: () => new URLSearchParams(currentSearch),
}));

describe('useDetailTab', () => {
    beforeEach(() => {
        replaceMock.mockReset();
        currentSearch = '';
    });

    it('returns first tab when query tab is missing or invalid', () => {
        const tabs = [{ id: 'overview' }, { id: 'analysis' }] as const;

        currentSearch = '';
        const { result, rerender } = renderHook(() => useDetailTab(tabs));
        expect(result.current[0]).toBe('overview');

        currentSearch = 'tab=not-valid';
        rerender();
        expect(result.current[0]).toBe('overview');
    });

    it('returns tab from query string when valid', () => {
        const tabs = [{ id: 'overview' }, { id: 'analysis' }] as const;
        currentSearch = 'tab=analysis';

        const { result } = renderHook(() => useDetailTab(tabs));

        expect(result.current[0]).toBe('analysis');
    });

    it('sets tab in query params preserving existing params', () => {
        const tabs = [{ id: 'overview' }, { id: 'analysis' }] as const;
        currentSearch = 'foo=bar';

        const { result } = renderHook(() => useDetailTab(tabs));
        result.current[1]('analysis');

        expect(replaceMock).toHaveBeenCalledWith('?foo=bar&tab=analysis', {
            scroll: false,
        });
    });
});
