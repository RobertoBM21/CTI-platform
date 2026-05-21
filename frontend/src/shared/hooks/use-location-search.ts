'use client';

import { useEffect, useState } from 'react';

export function useLocationSearch() {
    const [search, setSearch] = useState(() =>
        typeof window === 'undefined' ? '' : window.location.search,
    );

    useEffect(() => {
        const update = () => setSearch(window.location.search);
        update();
        window.addEventListener('popstate', update);
        window.addEventListener('focus', update);

        const interval = window.setInterval(update, 200);

        return () => {
            window.removeEventListener('popstate', update);
            window.removeEventListener('focus', update);
            window.clearInterval(interval);
        };
    }, []);

    return search;
}
