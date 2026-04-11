'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SlidingToggle } from '@/shared/components/sliding-toggle';
import { LayoutGrid, List, Search, SlidersHorizontal } from 'lucide-react';
import type { ViewMode } from '../types';

const viewModeOptions = [
    { value: 'list' as const, icon: List, label: 'List view' },
    { value: 'grid' as const, icon: LayoutGrid, label: 'Grid view' },
] satisfies [
    { value: 'list'; icon: typeof List; label: string },
    { value: 'grid'; icon: typeof LayoutGrid; label: string },
];

interface IncidentFiltersBarProps {
    search: string;
    onSearchChange: (value: string) => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    filtersOpen: boolean;
    onFiltersToggle: () => void;
    className?: string;
}

export function IncidentFiltersBar({
    search,
    onSearchChange,
    viewMode,
    onViewModeChange,
    filtersOpen,
    onFiltersToggle,
    className,
}: IncidentFiltersBarProps) {
    return (
        <div
            className={cn(
                'bg-card flex flex-col gap-2 rounded-2xl border border-white p-2 shadow-sm md:flex-row md:items-center',
                className,
            )}
        >
            {/* Search input */}
            <div className="relative flex-1">
                <Search className="text-foreground/40 pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2" />
                <input
                    type="text"
                    placeholder="Search by title, keyword or author..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="text-foreground placeholder:text-foreground/40 w-full bg-transparent py-3.5 pr-4 pl-12 text-sm focus:ring-0 focus:outline-none"
                />
            </div>

            {/* Separator */}
            <div className="bg-border mx-2 my-auto hidden h-8 w-px md:block" />

            {/* Controls */}
            <div className="flex items-center gap-2 overflow-x-auto pr-2 pb-2 md:pb-0">
                {/* Filters toggle */}
                <Button
                    variant={filtersOpen ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={onFiltersToggle}
                    className="h-10 rounded-xl px-3.5 text-[0.8rem] font-semibold shadow-none"
                >
                    <SlidersHorizontal className="size-3.5" />
                    Filters
                </Button>

                {/* View mode toggle with sliding animation */}
                <SlidingToggle
                    options={viewModeOptions}
                    value={viewMode}
                    onChange={onViewModeChange}
                />
            </div>
        </div>
    );
}
