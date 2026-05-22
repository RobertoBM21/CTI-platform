'use client';

import { useEffect, useState } from 'react';

export function useLocationSearch() {
    const [search, setSearch] = useState('');

    useEffect(() => {
        const update = () => setSearch(window.location.search);
        update();
        window.addEventListener('popstate', update);
        window.addEventListener('focus', update);

        return () => {
            window.removeEventListener('popstate', update);
            window.removeEventListener('focus', update);
        };
    }, []);

    return search;
}
