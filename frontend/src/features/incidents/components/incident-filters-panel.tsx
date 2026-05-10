'use client';

import { cn } from '@/lib/utils';
import { TLP } from '@/shared/types/enums';
import { X } from 'lucide-react';
import type { IncidentFilters } from '../types';

interface IncidentFiltersPanelProps {
    filters: IncidentFilters;
    onFiltersChange: (filters: IncidentFilters) => void;
    onClose: () => void;
    className?: string;
}

const tlpOptions = Object.values(TLP);

const tlpStyles: Record<
    TLP,
    { activeClassName: string; dotClassName: string; label: string }
> = {
    [TLP.WHITE]: {
        activeClassName:
            'border-foreground/18 bg-card text-foreground/85 dark:border-white/15 dark:bg-white/6 dark:text-white/90',
        dotClassName: 'bg-foreground/45 dark:bg-white/45',
        label: 'TLP:WHITE',
    },
    [TLP.CLEAR]: {
        activeClassName:
            'border-foreground/18 bg-card text-foreground/85 dark:border-white/15 dark:bg-white/6 dark:text-white/90',
        dotClassName: 'bg-foreground/45 dark:bg-white/45',
        label: 'TLP:CLEAR',
    },
    [TLP.GREEN]: {
        activeClassName:
            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-950/50 dark:text-emerald-300',
        dotClassName: 'bg-emerald-500 dark:bg-emerald-400',
        label: 'TLP:GREEN',
    },
    [TLP.AMBER]: {
        activeClassName:
            'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-700/60 dark:bg-amber-950/50 dark:text-amber-300',
        dotClassName: 'bg-amber-500 dark:bg-amber-400',
        label: 'TLP:AMBER',
    },
    [TLP.AMBER_STRICT]: {
        activeClassName:
            'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-700/60 dark:bg-orange-950/50 dark:text-orange-300',
        dotClassName: 'bg-orange-500 dark:bg-orange-400',
        label: 'TLP:AMBER+STRICT',
    },
    [TLP.RED]: {
        activeClassName:
            'border-red-200 bg-red-50 text-red-700 dark:border-red-700/60 dark:bg-red-950/50 dark:text-red-300',
        dotClassName: 'bg-red-600 dark:bg-red-400',
        label: 'TLP:RED',
    },
};

const sortOrderOptions = [
    { value: 'desc', label: 'Newest first' },
    { value: 'asc', label: 'Oldest first' },
] as const;

export function IncidentFiltersPanel({
    filters,
    onFiltersChange,
    onClose,
    className,
}: IncidentFiltersPanelProps) {
    return (
        <div
            className={cn(
                'border-border bg-card relative rounded-2xl border p-5 shadow-sm',
                className,
            )}
        >
            <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground absolute top-4 right-4 rounded-lg p-2 transition-colors"
                aria-label="Close filters"
            >
                <X className="size-4" />
            </button>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
                <section>
                    <p className="text-foreground mb-3 text-sm font-bold">
                        Traffic Light Protocol
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                        {tlpOptions.map((tlp) => {
                            const isActive = filters.tlp === tlp;
                            const config = tlpStyles[tlp];
                            return (
                                <button
                                    key={tlp}
                                    onClick={() =>
                                        onFiltersChange({
                                            ...filters,
                                            tlp: isActive ? undefined : tlp,
                                        })
                                    }
                                    className={cn(
                                        'border-border text-foreground/78 flex h-10 min-w-42 items-center gap-2.5 rounded-xl border px-3.5 text-left text-[0.72rem] font-bold tracking-[0.02em] transition-colors',
                                        isActive
                                            ? config.activeClassName
                                            : 'bg-background hover:border-foreground/15 hover:bg-secondary dark:hover:border-white/10 dark:hover:bg-white/5',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'size-2 rounded-full',
                                            config.dotClassName,
                                        )}
                                    />
                                    {config.label}
                                </button>
                            );
                        })}
                    </div>
                </section>

                <section>
                    <p className="text-foreground mb-3 text-sm font-bold">
                        Order
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                        {sortOrderOptions.map((opt) => {
                            const isActive =
                                (filters.sortOrder ?? 'desc') === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() =>
                                        onFiltersChange({
                                            ...filters,
                                            sortOrder: opt.value,
                                        })
                                    }
                                    className={cn(
                                        'border-border text-foreground/78 flex h-10 min-w-42 items-center rounded-xl border px-3.5 text-left text-[0.72rem] font-bold tracking-[0.02em] transition-colors',
                                        isActive
                                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                            : 'bg-background hover:border-foreground/15 hover:bg-secondary dark:hover:border-white/10 dark:hover:bg-white/5',
                                    )}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
}
