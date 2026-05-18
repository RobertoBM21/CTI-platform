'use client';

import { useRouter, useSearchParams } from 'next/navigation';

// URL-synced tab state for detail pages.
export function useDetailTab<T extends string>(
    tabs: readonly { id: T }[],
): [T, (tab: T) => void] {
    const router = useRouter();
    const searchParams = useSearchParams();

    const rawTab = searchParams.get('tab');
    const activeTab: T = tabs.some((t) => t.id === rawTab)
        ? (rawTab as T)
        : tabs[0]!.id;

    function setActiveTab(tab: T) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tab);
        router.replace(`?${params.toString()}`, { scroll: false });
    }

    return [activeTab, setActiveTab];
}
