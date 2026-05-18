'use client';

import { usePageTitle } from '@/providers/page-title-context';
import { useEffect } from 'react';

export function useEntityPageTitle(name: string | undefined): void {
    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        if (name) {
            setPageTitle(name);
        }
        return () => setPageTitle('');
    }, [name, setPageTitle]);
}
