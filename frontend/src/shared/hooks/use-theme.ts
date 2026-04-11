'use client';

import { useCallback, useSyncExternalStore } from 'react';

function getSnapshot(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light';
    return (localStorage.getItem('theme') as 'light' | 'dark') ?? 'light';
}

function getServerSnapshot(): 'light' | 'dark' {
    return 'light';
}

function subscribe(callback: () => void): () => void {
    window.addEventListener('storage', callback);
    return () => window.removeEventListener('storage', callback);
}

export function useTheme() {
    const theme = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot,
    );

    const setTheme = useCallback((next: 'light' | 'dark') => {
        localStorage.setItem('theme', next);
        document.documentElement.classList.toggle('dark', next === 'dark');
        window.dispatchEvent(new StorageEvent('storage'));
    }, []);

    return { theme, setTheme };
}
