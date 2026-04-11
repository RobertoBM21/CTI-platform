'use client';

import { useTheme } from '@/shared/hooks/use-theme';
import { Moon, Sun } from 'lucide-react';
import { SlidingToggle } from './sliding-toggle';

const themeOptions = [
    { value: 'light' as const, icon: Sun, label: 'Light mode' },
    { value: 'dark' as const, icon: Moon, label: 'Dark mode' },
] satisfies [
    { value: 'light'; icon: typeof Sun; label: string },
    { value: 'dark'; icon: typeof Moon; label: string },
];

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <SlidingToggle
            options={themeOptions}
            value={theme}
            onChange={setTheme}
        />
    );
}
